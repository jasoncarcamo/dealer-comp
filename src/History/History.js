import React, { Component } from 'react';
import { Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

class History extends Component {
  // Group salesData by month-year with team totals
  aggregateByMonth() {
    const { salesData, teams } = this.props;
    // { "YYYY-MM": { teamName: totalSales, ... } }

    const monthly = {};

    salesData.forEach((dayEntry) => {
      const month = dayEntry.date.slice(0, 7);
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

    // Convert monthly to sorted array
    const result = Object.entries(monthly)
      .map(([month, totals]) => ({ month, totals }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));

    return result;
  }

  render() {
    const { teams } = this.props;
    if (!teams.length) {
      return <Typography>No teams to show history for.</Typography>;
    }

    const monthlyData = this.aggregateByMonth();

    if (!monthlyData.length) {
      return <Typography>No sales data available.</Typography>;
    }

    return (
      <div>
        <Typography variant="h5" gutterBottom>
          Competition History by Month
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                {teams.map((team) => (
                  <TableCell key={team.name} align="right" style={{ color: team.color }}>
                    {team.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyData.map(({ month, totals }) => (
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
      </div>
    );
  }
}

export default History;
