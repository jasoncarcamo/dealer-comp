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
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: this.getTodayDate(),
      viewMode: 'day', // 'day', 'week', 'month'
      dragListOrder: [], // salespeople order in drag list
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

  aggregateByMonth() {
    const { salesData, teams } = this.props;
    if (!Array.isArray(salesData) || !Array.isArray(teams)) return [];

    const monthly = {};

    salesData.forEach((dayEntry) => {
      const month = dayEntry.date?.slice(0, 7);
      if (!month) return;
      if (!monthly[month]) {
        monthly[month] = {};
        teams.forEach((t) => (monthly[month][t.name] = 0));
      }
      teams.forEach((team) => {
        if (team.members && team.members.length) {
          let total = 0;
          team.members.forEach((m) => {
            total += dayEntry[m] || 0;
          });
          monthly[month][team.name] += total;
        }
      });
    });

    return Object.entries(monthly)
      .map(([month, totals]) => ({ month, totals }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));
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

    // Build sales by team and person: { teamName: { personName: totalSales, ... } }
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
      html += `<h2>Team: ${team.name}</h2>`;
      html += `<table><thead><tr><th>Salesperson</th><th>Sales</th></tr></thead><tbody>`;

      let teamTotal = 0;
      Object.entries(salesByTeam[team.name]).forEach(([person, sales]) => {
        html += `<tr><td>${person}</td><td>${sales}</td></tr>`;
        teamTotal += sales;
      });

      html += `<tr style="font-weight:bold;"><td>Total</td><td>${teamTotal}</td></tr>`;
      html += `</tbody></table>`;
    });

    html += `
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.body.innerHTML = html;
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  render() {
    const { teams, people } = this.props;
    const { selectedDate, viewMode, dragListOrder } = this.state;

    if (!Array.isArray(teams) || teams.length === 0) {
      return <Typography>No teams to show history for.</Typography>;
    }

    const salesForPeriod = this.getSalesForPeriod();

    return (
      <Box sx={{ maxWidth: 900, margin: '0 auto', p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Competition History
        </Typography>

        {/* Date & View Mode Selection */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
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
            <ToggleButton value="day" aria-label="Day view">
              Day
            </ToggleButton>
            <ToggleButton value="week" aria-label="Week view">
              Week
            </ToggleButton>
            <ToggleButton value="month" aria-label="Month view">
              Month
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" onClick={this.handlePrint} sx={{ ml: 2 }}>
            Print Report
          </Button>
        </Box>

        {/* Draggable Sales List */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Sales Progress ({viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}) for {selectedDate}
        </Typography>
        <Paper sx={{ maxHeight: 300, overflowY: 'auto', mb: 4 }}>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="salespeople">
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: 100,
                    backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'white',
                  }}
                >
                  {(!dragListOrder || dragListOrder.length === 0) && (
                    <Typography sx={{ p: 2 }}>No salespeople found.</Typography>
                  )}

                  {dragListOrder &&
                    dragListOrder.map((personName, index) => (
                      <Draggable key={personName} draggableId={personName} index={index}>
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              userSelect: 'none',
                              p: 1.5,
                              m: 1,
                              bgcolor: snapshot.isDragging ? '#90caf9' : '#f0f0f0',
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontWeight: '500',
                              fontSize: '1rem',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }}
                            aria-label={`Salesperson ${personName} sales count`}
                          >
                            <span>{personName}{this.renderTeamName(personName)}</span>
                            <span>{salesForPeriod?.[personName] || 0}</span>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>

        {/* Monthly Team Sales Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                {teams.map((team) => (
                  <TableCell
                    key={team.name}
                    align="right"
                    style={{ color: team.color || undefined }}
                  >
                    {team.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {this.aggregateByMonth().map(({ month, totals }) => (
                <TableRow key={month}>
                  <TableCell>{month}</TableCell>
                  {teams.map((team) => (
                    <TableCell key={team.name} align="right">
                      {totals[team.name] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
}

export default History;
