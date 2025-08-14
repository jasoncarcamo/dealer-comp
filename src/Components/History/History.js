import React, { Component } from 'react';
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Tooltip,
} from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: this.getTodayDate(),
      viewMode: 'day',
      dragListOrder: [],
    };
  }

  handleDownloadPDF = () => {
  const { teams } = this.props;
  const { selectedDate, viewMode } = this.state;

  if (!teams || teams.length === 0) {
    alert('No teams to generate PDF.');
    return;
  }

  const getDateRange = () => {
    const dateObj = new Date(selectedDate);
    let startDate, endDate;

    if (viewMode === 'day') {
      startDate = new Date(selectedDate);
      endDate = new Date(selectedDate);
    } else if (viewMode === 'week') {
      const day = dateObj.getDay();
      startDate = new Date(dateObj);
      startDate.setDate(dateObj.getDate() - day);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (viewMode === 'month') {
      startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
      endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
    }
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Determine scaling based on number of rows
  const totalRows = teams.reduce((acc, team) => acc + Math.max(team.members.length, 5) + 2, 0); // +2 for headers & totals
  let fontSize = 12;
  let cellPadding = 6;

  if (totalRows > 25) {
    fontSize = 10;
    cellPadding = 4;
  } 
  if (totalRows > 40) {
    fontSize = 8;
    cellPadding = 3;
  }

  // Create container for report HTML
  const container = document.createElement('div');
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.padding = '15px';
  container.style.fontSize = `${fontSize}px`;
  container.innerHTML = `<h1 style="font-size:${fontSize + 4}px;">Sales Report (${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)})</h1>
    <p>Date range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>`;

  teams.forEach((team) => {
    const teamSales = {};
    team.members.forEach((m) => { teamSales[m] = 0; });

    this.props.salesData
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      })
      .forEach((entry) => {
        team.members.forEach((m) => {
          if (entry[m] !== undefined) teamSales[m] += entry[m];
        });
      });

    const maxSales = Math.max(...Object.values(teamSales));
    const topSalespeople = Object.entries(teamSales)
      .filter(([_, sales]) => sales === maxSales && maxSales > 0)
      .map(([person]) => person);

    let teamTotal = 0;
    let html = `<h2 style="font-size:${fontSize + 2}px;">${team.name}</h2>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 10px; font-size:${fontSize}px;">
        <thead>
          <tr>
            <th style="border:1px solid #ccc; padding:${cellPadding}px;text-align:left;">Salesperson</th>
            <th style="border:1px solid #ccc; padding:${cellPadding}px;text-align:right;">Sales</th>
          </tr>
        </thead>
        <tbody>`;

    Object.entries(teamSales)
  .sort((a, b) => b[1] - a[1])
  .forEach(([person, sales]) => {
      const isTop = topSalespeople.includes(person);
      html += `<tr style="font-weight: ${isTop ? 'bold' : 'normal'}; background-color: ${isTop ? '#EB0A1E' : 'inherit'}; color: ${isTop ? 'white' : 'inherit'};">
        <td style="border:1px solid #ccc; padding:${cellPadding}px;text-align:left;">${person}${isTop ? ' - Top salesperson' : ''}</td>
        <td style="border:1px solid #ccc; padding:${cellPadding}px;text-align:right;">${sales}</td>
      </tr>`;
      teamTotal += sales;
    });

    html += `<tr style="font-weight:bold;">
      <td style="border:1px solid #ccc; padding:${cellPadding}px;text-align:left;">Total</td>
      <td style="border:1px solid #ccc; padding:${cellPadding}px;text-align:right;">${teamTotal}</td>
    </tr>`;
    html += `</tbody></table>`;
    container.innerHTML += html;
  });

  import('html2pdf.js').then((html2pdf) => {
    const opt = {
      margin: 10,
      filename: `sales-report-${selectedDate}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };
    html2pdf.default().from(container).set(opt).save();
  });
};



  getTodayDate() {
    return new Date().toISOString().slice(0, 10);
  }

  componentDidMount() {
    this.initializeDragList();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.selectedDate !== this.state.selectedDate ||
      prevState.viewMode !== this.state.viewMode ||
      prevProps.people !== this.props.people
    ) {
      this.initializeDragList();
    }
  }

  initializeDragList() {
    const { people } = this.props;
    const order = Array.isArray(people) ? people.map((p) => p.name) : [];
    this.setState({ dragListOrder: order });
  }

  onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const newOrder = Array.from(this.state.dragListOrder);
    const [moved] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, moved);
    this.setState({ dragListOrder: newOrder });
  };

  getSalesForPeriod() {
    const { salesData, people } = this.props;
    const { selectedDate, viewMode } = this.state;

    if (!Array.isArray(people) || !Array.isArray(salesData)) return {};

    let startDate, endDate;
    const dateObj = new Date(selectedDate);

    if (viewMode === 'day') {
      startDate = new Date(selectedDate);
      endDate = new Date(selectedDate);
    } else if (viewMode === 'week') {
      const day = dateObj.getDay();
      startDate = new Date(dateObj);
      startDate.setDate(dateObj.getDate() - day);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (viewMode === 'month') {
      startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
      endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
    }

    const filteredEntries = salesData.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const salesSum = {};
    people.forEach((p) => {
      salesSum[p.name] = 0;
    });

    filteredEntries.forEach((entry) => {
      people.forEach((p) => {
        salesSum[p.name] += entry[p.name] || 0;
      });
    });

    return salesSum;
  }

  filterSalesDataForCurrentMonth(month) {
    const { salesData } = this.props;
    if (!Array.isArray(salesData) || salesData.length === 0) return [];
    const now = new Date();
    const currentYear = now.getFullYear();
    return salesData.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear && entryDate.getMonth() === month;
    });
  }

  getSalespersonTotals(month) {
    const { teams } = this.props;
    const filteredData = this.filterSalesDataForCurrentMonth(month);
    const totals = {};
    const allMembers = new Set();
    teams.forEach((team) => {
      if (team.members) team.members.forEach((m) => allMembers.add(m));
    });
    allMembers.forEach((member) => (totals[member] = 0));
    filteredData.forEach((dayEntry) => {
      allMembers.forEach((member) => {
        totals[member] += dayEntry[member] || 0;
      });
    });
    return totals;
  }

  getTeamTotals(salespersonTotals) {
    const { teams } = this.props;
    const teamTotals = {};
    teams.forEach((team) => {
      let total = 0;
      if (team.members && team.members.length) {
        team.members.forEach((member) => {
          total += salespersonTotals[member] || 0;
        });
      }
      teamTotals[team.name] = total;
    });
    return teamTotals;
  }

  aggregateByMonth() {
    const { salesData, teams } = this.props;
    if (!Array.isArray(salesData) || !Array.isArray(teams)) return [];

    const monthly = {};
    salesData.forEach((dayEntry) => {
      let month = dayEntry.date.slice(0, 7); // YYYY-MM
      if (!monthly[month]) {
        monthly[month] = {};
        teams.forEach((team) => {
          monthly[month][team.name] = 0;
        });
      }
      const salespersonTotals = this.getSalespersonTotals(new Date(dayEntry.date).getMonth());
      const teamTotals = this.getTeamTotals(salespersonTotals);
      teams.forEach((team) => {
        monthly[month][team.name] = teamTotals[team.name] || 0;
      });
    });

    return Object.entries(monthly)
      .map(([month, totals]) => ({ month, totals }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));
  }

  getMonthlySalesByMember() {
    const { teams, salesData } = this.props;
    if (!Array.isArray(teams) || !Array.isArray(salesData)) return {};

    const monthlyMemberSales = {};

    salesData.forEach((entry) => {
      const month = entry.date.slice(0, 7); // YYYY-MM
      if (!monthlyMemberSales[month]) monthlyMemberSales[month] = {};

      teams.forEach((team) => {
        if (team.members) {
          team.members.forEach((member) => {
            if (!(member in monthlyMemberSales[month])) monthlyMemberSales[month][member] = 0;
            monthlyMemberSales[month][member] += entry[member] || 0;
          });
        }
      });
    });

    return monthlyMemberSales;
  }

  renderTeamName = (personName) => {
    const teams = this.props.teams;
    let teamName = 'Not in a team';
    for (let team of teams) {
      if (team.members.includes(personName)) {
        teamName = team.name;
        break;
      }
    }
    return ` (${teamName})`;
  };

  handlePrint = () => {
  const { teams, salesData } = this.props;
  const { selectedDate, viewMode } = this.state;

  if (!teams || teams.length === 0) {
    alert('No teams to print.');
    return;
  }

  // Get date range based on viewMode
  const getDateRange = () => {
    const dateObj = new Date(selectedDate);
    let startDate, endDate;

    if (viewMode === 'day') {
      startDate = new Date(selectedDate);
      endDate = new Date(selectedDate);
    } else if (viewMode === 'week') {
      const day = dateObj.getDay();
      startDate = new Date(dateObj);
      startDate.setDate(dateObj.getDate() - day);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (viewMode === 'month') {
      startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
      endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
    }
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Filter salesData for date range
  const filteredEntries = salesData.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  // Build sales by team and person
  const salesByTeam = {};
  teams.forEach((team) => {
    salesByTeam[team.name] = {};
    team.members.forEach((member) => {
      salesByTeam[team.name][member] = 0;
    });
  });

  filteredEntries.forEach((entry) => {
    teams.forEach((team) => {
      team.members.forEach((member) => {
        if (entry[member] !== undefined) {
          salesByTeam[team.name][member] += entry[member];
        }
      });
    });
  });

  // Create HTML for print
  // inside handlePrint()
let totalRows = teams.reduce((acc, team) => acc + Math.max(team.members.length, 5) + 2, 0);
let fontSize = 12;
let cellPadding = 8;

if (totalRows > 25) {
  fontSize = 10;
  cellPadding = 6;
} 
if (totalRows > 40) {
  fontSize = 8;
  cellPadding = 4;
}

let html = `
<html>
  <head>
    <title>Sales Report (${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)})</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; font-size: ${fontSize}px; }
      h1 { font-size: ${fontSize + 4}px; }
      h2 { font-size: ${fontSize + 2}px; margin-top: 25px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 10px; font-size: ${fontSize}px; }
      th, td { border: 1px solid #ccc; padding: ${cellPadding}px; text-align: right; }
      th { background-color: #f0f0f0; color: black; }
      th:first-child, td:first-child { text-align: left; }
    </style>
  </head>
  <body>
    <h1>Sales Report (${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)})</h1>
    <p>Date range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
`;

teams.forEach((team) => {
  const teamSales = salesByTeam[team.name];
  const maxSales = Math.max(...Object.values(teamSales));
  const topSalespeople = Object.entries(teamSales)
    .filter(([_, sales]) => sales === maxSales && maxSales > 0)
    .map(([person]) => person);

  let teamTotal = 0;
  html += `<h2>${team.name}</h2>
    <table>
      <thead>
        <tr>
          <th>Salesperson</th>
          <th>Sales</th>
        </tr>
      </thead>
      <tbody>`;

  Object.entries(teamSales)
  .sort((a, b) => b[1] - a[1])
  .forEach(([person, sales]) => {
    const isTop = topSalespeople.includes(person);
    html += `<tr style="font-weight: ${isTop ? 'bold' : 'normal'}; background-color:  'inherit'; color: 'inherit';">
      <td style="padding:${cellPadding}px;">${person}${isTop ? ' - Top salesperson' : ''}</td>
      <td style="padding:${cellPadding}px;">${sales}</td>
    </tr>`;
    teamTotal += sales;
  });

  html += `<tr style="font-weight:bold;">
    <td style="padding:${cellPadding}px;">Total</td>
    <td style="padding:${cellPadding}px;">${teamTotal}</td>
  </tr>`;
  html += `</tbody></table>`;
});

html += `</body></html>`;


  // Open print window
  const printWindow = window.open('', '', 'width=1000,height=800');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};


  render() {
    const { teams, people } = this.props;
    const { selectedDate, viewMode, dragListOrder } = this.state;
    const salesForPeriod = this.getSalesForPeriod();
    const salespersonTotals = this.getSalespersonTotals();
    const teamTotals = this.getTeamTotals(salespersonTotals);
    const monthlyMemberSales = this.getMonthlySalesByMember();

    if (!Array.isArray(teams) || teams.length === 0) {
      return <Typography>No teams to show history for.</Typography>;
    }

    return (
      <Box sx={{ maxWidth: 900, margin: '0 auto', p: 3 }}>
  <Typography variant="h5" gutterBottom>
    Competition History
  </Typography>

  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
    <TextField
      label="Select Date"
      type="date"
      value={selectedDate}
      onChange={(e) => this.setState({ selectedDate: e.target.value })}
      inputProps={{ max: this.getTodayDate() }}
    />
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(e, val) => val && this.setState({ viewMode: val })}
      aria-label="View mode"
      size="small"
    >
      <ToggleButton value="day">Day</ToggleButton>
      <ToggleButton value="week">Week</ToggleButton>
      <ToggleButton value="month">Month</ToggleButton>
    </ToggleButtonGroup>
    <Button variant="contained" sx={{ ml: 2 }} onClick={this.handlePrint}>
      Print Report
    </Button>
    <Button variant="outlined" sx={{ ml: 1 }} onClick={this.handleDownloadPDF}>
      Download PDF
    </Button>
  </Box>

  <Typography variant="h6" sx={{ mb: 1 }}>
    Sales Progress ({viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}) for {selectedDate}
  </Typography>

  {/* PDF Container */}
  <Box id="sales-report-container" sx={{ backgroundColor: 'white', p: 2 }}>
    {/* Main Team Table */}
    <Paper sx={{ maxHeight: 450, overflowY: 'auto', mb: 4 }}>
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Teams</TableCell>
              <TableCell align="right">Sales</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams && teams.length > 0 ? (
              teams.map((team) => {
                const teamSales = {};
                team.members.forEach((member) => {
                  teamSales[member] = salesForPeriod[member] || 0;
                });

                const maxSales = Math.max(...Object.values(teamSales));
                const topSalespeople = Object.entries(teamSales)
                  .filter(([_, sales]) => sales === maxSales && maxSales > 0)
                  .map(([person]) => person);

                let teamTotal = Object.values(teamSales).reduce((a, b) => a + b, 0);

                const teamTotals = teams.reduce((acc, team) => {
                  acc[team.name] = team.members.reduce((sum, m) => sum + (salesForPeriod[m] || 0), 0);
                  return acc;
                }, {});
                const maxTotal = Math.max(...Object.values(teamTotals));
                const isTopTeam = teamTotals[team.name] === maxTotal && maxTotal > 0;

                return (
                  <React.Fragment key={team.name}>
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        {team.name}{`${isTopTeam ? " - Winner" : ""}`}
                      </TableCell>
                    </TableRow>
                    {Object.entries(teamSales)
                      .sort((a, b) => b[1] - a[1]) // sort descending by sales
                      .map(([person, sales]) => (
                        <TableRow
                          key={person}
                          sx={{
                            fontWeight: topSalespeople.includes(person) ? 'bold' : 'normal',
                            backgroundColor: topSalespeople.includes(person) ? '#EB0A1E' : 'inherit',
                          }}
                        >
                          <TableCell sx={{color: topSalespeople.includes(person) ? 'white' : 'inherit',}}>
                            {person} {topSalespeople.includes(person) ? " - Top salesperson in team" : ""}
                          </TableCell>
                          <TableCell align="right" sx={{color: topSalespeople.includes(person) ? 'white' : 'inherit',}}>
                            {sales}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold'}}>Total</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {teamTotal}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No salespeople found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Mobile Cards */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 4 }}>
        {this.aggregateByMonth().map(({ month, totals }) => {
          const maxSales = Math.max(...Object.values(totals));
          return (
            <Paper key={month} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {month}
              </Typography>
              {teams.map((team) => {
                const isMax = totals[team.name] === maxSales;
                const members = team.members || [];
                return (
                  <Tooltip
                    key={team.name}
                    title={`Members: ${members.map((m) => `${m} (${monthlyMemberSales[month]?.[m] || 0})`).join(', ')}`}
                    arrow
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.5,
                        p: 1,
                        bgcolor: '#f0f0f0',
                        borderRadius: 1,
                        fontWeight: isMax ? 'bold' : 'normal',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    >
                      <span>{team.name}</span>
                      <span>{totals[team.name] || 0}</span>
                    </Box>
                  </Tooltip>
                );
              })}
            </Paper>
          );
        })}
      </Box>

    {/* Desktop Table */}
    <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
      <TableContainer component={Paper} sx={{ minWidth: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              {teams.map((team) => (
                <TableCell key={team.name} align="right">{team.name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.aggregateByMonth().map(({ month, totals }) => {
              const maxSales = Math.max(...Object.values(totals));
              return (
                <TableRow key={month}>
                  <TableCell>{month}</TableCell>
                  {teams.map((team) => {
                    const isMax = totals[team.name] === maxSales;
                    const members = team.members || [];
                    return (
                      <Tooltip
                        key={team.name}
                        title={`Members: ${members.map((m) => `${m} (${monthlyMemberSales[month]?.[m] || 0})`).join(', ')}`}
                        arrow
                      >
                        <TableCell
                          align="right"
                          sx={{ fontWeight: isMax ? 'bold' : 'normal', cursor: 'pointer', minWidth: 80 }}
                        >
                          {totals[team.name] || 0}
                        </TableCell>
                      </Tooltip>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  </Box>
</Box>

    );
  }
}

export default History;
