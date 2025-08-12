import React, { Component } from 'react';
import { Typography, Box, Paper } from '@mui/material';
import {
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

class CompetitionAndCharts extends Component {
  filterSalesDataForCurrentMonth() {
    const { salesData } = this.props;
    if (!Array.isArray(salesData) || salesData.length === 0) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return salesData.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === currentYear &&
        entryDate.getMonth() === currentMonth
      );
    });
  }

  getSalespersonTotals() {
    const { teams } = this.props;
    const filteredData = this.filterSalesDataForCurrentMonth();
    const totals = {};

    const allMembers = new Set();
    teams.forEach((team) => {
      if (team.members) team.members.forEach((m) => allMembers.add(m));
    });

    allMembers.forEach((member) => {
      totals[member] = 0;
    });

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

  aggregateSalesBySalesperson(team) {
    const filteredData = this.filterSalesDataForCurrentMonth();
    const result = [];

    filteredData.forEach((dayEntry) => {
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

  // Custom tooltip for the bar chart that shows team members
  CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && this.props.teams.length) {
      const teamName = label;
      const team = this.props.teams.find((t) => t.name === teamName);
      const totalSales = payload[0].value;

      return (
        <Paper
          elevation={3}
          sx={{
            padding: 1,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            maxWidth: 250,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Team: {teamName}
          </Typography>
          <Typography variant="body2">Total Sales: {totalSales}</Typography>
          <Typography variant="body2" mt={1} fontWeight="bold">
            Members:
          </Typography>
          {team && team.members && team.members.length ? (
            team.members.map((member) => (
              <Typography key={member} variant="body2">
                {member}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No members
            </Typography>
          )}
        </Paper>
      );
    }

    return null;
  };

  render() {
    const { teams } = this.props;
    const salespersonTotals = this.getSalespersonTotals();
    const teamTotals = this.getTeamTotals(salespersonTotals);

    if (!teams.length) {
      return <Typography>No teams available. Please add teams first.</Typography>;
    }

    if (teams.length === 0 || Object.keys(teamTotals).length === 0) {
      return <Typography>No sales data available for the current month.</Typography>;
    }

    const barData = teams.map((team) => ({
      team: team.name,
      totalSales: teamTotals[team.name] || 0,
      color: team.color || '#8884d8',
    }));

    return (
      <Box sx={{ maxWidth: 900, margin: '0 auto', padding: 2 }}>
        <Typography variant="h5" gutterBottom>
          Team Sales Over Time (Current Month)
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

        {/* Bar chart for current month total sales per team */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={barData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="team" tick={{ textAnchor: 'middle' }} />
            <YAxis allowDecimals={false} />
            <Tooltip content={<this.CustomTooltip />} />
            <Legend />
            <Bar dataKey="totalSales" name="Total Sales">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Sub line charts per team showing salesperson daily sales */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Salesperson Daily Sales by Team (Current Month)
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
