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
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: this.getTodayDate(),
      viewMode: 'day',
      dragListOrder: [],
    };
  }

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
  let html = `
  <html>
    <head>
      <title>Sales Report (${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)})</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { margin-top: 30px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
        th { background-color: #f0f0f0; color: black; }
        th:first-child, td:first-child { text-align: left; }
      </style>
    </head>
    <body>
      <h1>Sales Report (${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)})</h1>
      <p>Date range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
  `;

  teams.forEach((team) => {
    html += `<h2>Team: ${team.name} </h2>`;
    html += `<table><thead><tr><th>Salesperson</th><th>Sales</th></tr></thead><tbody>`;

    const teamSales = salesByTeam[team.name];
    const maxSales = Math.max(...Object.values(teamSales));
    const topSalespeople = Object.entries(teamSales)
      .filter(([_, sales]) => sales === maxSales && maxSales > 0)
      .map(([person]) => person);

    let teamTotal = 0;

    const { teams, people } = this.props;
    const { selectedDate, viewMode, dragListOrder } = this.state;
    const salesForPeriod = this.getSalesForPeriod();
    const salespersonTotals = this.getSalespersonTotals();
    const monthlyMemberSales = this.getMonthlySalesByMember();

    // Calculate total sales for all teams
    const teamTotals = teams.reduce((acc, team) => {
      acc[team.name] = team.members.reduce((sum, m) => sum + (salesForPeriod[m] || 0), 0);
      return acc;
    }, {});

    // Find the maximum total
    const maxTotal = Math.max(...Object.values(teamTotals));

    // Check if a specific team has the highest total
    const isTopTeam = teamTotals[team.name] === maxTotal && maxTotal > 0;

    Object.entries(teamSales).forEach(([person, sales]) => {
      const isTop = topSalespeople.includes(person);
      html += `<tr style="
        font-weight: ${isTop ? 'bold' : 'normal'};
        background-color: ${isTop ? '#EB0A1E' : 'inherit'};
        fontWeight: ${isTop ? 'bolder' : 'inherit'};
      ">
        <td>${person} ${isTop ? " - Top salesperson in team" : ""}</td>
        <td>${sales}</td>
      </tr>`;
      teamTotal += sales;
    });
    
    html += `<tr style="font-weight: bold}"><td>Total ${isTopTeam ? " - Winning" : ""}</td><td>${teamTotal}</td></tr>`;
    html += `</tbody></table>`;
  });

  html += `</body></html>`;


  // Open print window
  const printWindow = window.open('', '', 'width=900,height=700');
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
        </Box>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Sales Progress ({viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}) for {selectedDate}
        </Typography>

        <Paper sx={{ maxHeight: 450, overflowY: 'auto', mb: 4, marginBottom: ".25em" }}>
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

                    // Determine top salesperson(s) in team
                    const maxSales = Math.max(...Object.values(teamSales));
                    const topSalespeople = Object.entries(teamSales)
                      .filter(([_, sales]) => sales === maxSales && maxSales > 0)
                      .map(([person]) => person);

                    let teamTotal = Object.values(teamSales).reduce((a, b) => a + b, 0);

                    // Calculate total sales for all teams
                    const teamTotals = teams.reduce((acc, team) => {
                      acc[team.name] = team.members.reduce((sum, m) => sum + (salesForPeriod[m] || 0), 0);
                      return acc;
                    }, {});
                    // Find the maximum total
                    const maxTotal = Math.max(...Object.values(teamTotals));
                    // Check if a specific team has the highest total
                    const isTopTeam = teamTotals[team.name] === maxTotal && maxTotal > 0;

                    return (
                      <React.Fragment key={team.name}>
                        <TableRow>
                          <TableCell colSpan={2} sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                            {team.name}{`${isTopTeam ? " - Winner" : ""}`}
                          </TableCell>
                        </TableRow>
                        {Object.entries(teamSales).map(([person, sales]) => (
                          <TableRow
                            key={person}
                            sx={{
                              fontWeight: topSalespeople.includes(person) ? 'bold' : 'normal',
                              backgroundColor: topSalespeople.includes(person) ? '#EB0A1E' : 'inherit',
                            }}
                          >
                            <TableCell sx={{color: topSalespeople.includes(person) ? 'white' : 'inherit',}}>{person} {topSalespeople.includes(person) ? " - Top salesperson in team" : ""}</TableCell>
                            <TableCell 
                              align="right" 
                              sx={{color: topSalespeople.includes(person) ? 'white' : 'inherit',}}>{sales}</TableCell>
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
    );
  }
}

export default History;
