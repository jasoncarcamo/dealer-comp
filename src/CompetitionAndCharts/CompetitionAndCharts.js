import React, { Component } from 'react';
import { Typography, Box, Paper } from '@mui/material';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

class CompetitionAndCharts extends Component {
  // Aggregate sales data per day per team (existing)
  aggregateSalesByTeam() {
    const { salesData, teams } = this.props;

    const result = [];

    salesData.forEach((dayEntry) => {
      const day = { date: dayEntry.date };
      teams.forEach((team) => {
        let total = 0;
        if (team.members && team.members.length) {
          team.members.forEach((member) => {
            total += dayEntry[member] || 0;
          });
        }
        day[team.name] = total;
      });
      result.push(day);
    });

    result.sort((a, b) => (a.date > b.date ? 1 : -1));

    return result;
  }

  // Calculate total sales per salesperson across all dates
  getSalespersonTotals() {
    const { salesData, teams } = this.props;
    const totals = {};

    const allMembers = new Set();
    teams.forEach((team) => {
      if (team.members) team.members.forEach((m) => allMembers.add(m));
    });

    allMembers.forEach((member) => {
      totals[member] = 0;
    });

    salesData.forEach((dayEntry) => {
      allMembers.forEach((member) => {
        totals[member] += dayEntry[member] || 0;
      });
    });

    return totals;
  }

  // Calculate total sales per team by summing members' totals
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

  // Aggregate daily sales per salesperson for a given team
  aggregateSalesBySalesperson(team) {
    const { salesData } = this.props;
    const result = [];

    salesData.forEach((dayEntry) => {
      const day = { date: dayEntry.date };
      if (team.members && team.members.length) {
        team.members.forEach((member) => {
          day[member] = dayEntry[member] || 0;
        });
      }
      result.push(day);
    });

    result.sort((a, b) => (a.date > b.date ? 1 : -1));
    return result;
  }

  // Generate distinct colors for salespeople lines per team (fallback)
  generateColors(count) {
    const baseColors = [
      '#8884d8',
      '#82ca9d',
      '#ffc658',
      '#ff8042',
      '#8dd1e1',
      '#a4de6c',
      '#d0ed57',
      '#888888',
    ];
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
  }

  render() {
    const { teams } = this.props;
    const data = this.aggregateSalesByTeam();

    if (!teams.length) {
      return <Typography>No teams available. Please add teams first.</Typography>;
    }
    if (!data.length) {
      return <Typography>No sales data available.</Typography>;
    }

    const salespersonTotals = this.getSalespersonTotals();
    const teamTotals = this.getTeamTotals(salespersonTotals);

    return (
      <Box sx={{ maxWidth: 900, margin: '0 auto', padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Team Sales Over Time
        </Typography>

        {/* Totals summary */}
        <Box sx={{ mb: 4 }}>
          {teams.map((team) => (
            <Paper
              key={team.name}
              sx={{ mb: 2, p: 2, borderLeft: `6px solid ${team.color}`, boxShadow: 1 }}
            >
              <Typography variant="h6" sx={{ color: team.color }}>
                {team.name} — Total Sales: {teamTotals[team.name] || 0}
              </Typography>
              <Box sx={{ pl: 2, mt: 1 }}>
                {team.members && team.members.length ? (
                  team.members.map((member) => (
                    <Typography key={member} variant="body2" sx={{ color: '#555' }}>
                      {member}: {salespersonTotals[member] || 0}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No members
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Main team sales line chart */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            {teams.map((team) => (
              <Line
                key={team.name}
                type="monotone"
                dataKey={team.name}
                stroke={team.color}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Sub line charts per team showing salesperson daily sales */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Salesperson Daily Sales by Team
          </Typography>
          {teams.map((team) => {
            if (!team.members || team.members.length === 0) {
              return (
                <Typography key={team.name} color="text.secondary" sx={{ mb: 3 }}>
                  No members in team "{team.name}" to display sales.
                </Typography>
              );
            }

            const salesDataPerSalesperson = this.aggregateSalesBySalesperson(team);
            const colors = this.generateColors(team.members.length);

            return (
              <Paper
                key={team.name}
                sx={{
                  mb: 5,
                  p: 2,
                  borderLeft: `6px solid ${team.color}`,
                  boxShadow: 1,
                }}
                aria-label={`Salesperson daily sales for team ${team.name}`}
              >
                <Typography variant="h6" sx={{ color: team.color, mb: 2 }}>
                  {team.name} - Salesperson Daily Sales
                </Typography>

                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={salesDataPerSalesperson}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {team.members.map((member, idx) => (
                      <Line
                        key={member}
                        type="monotone"
                        dataKey={member}
                        stroke={colors[idx]}
                        dot={false}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            );
          })}
        </Box>
      </Box>
    );
  }
}

export default CompetitionAndCharts;
