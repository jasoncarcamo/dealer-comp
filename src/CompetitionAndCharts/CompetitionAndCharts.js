import React, { Component } from 'react';
import { Typography } from '@mui/material';
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
  // Prepare data aggregated per day per team
  aggregateSalesByTeam() {
    const { salesData, teams } = this.props;
    // salesData: [{ date: 'YYYY-MM-DD', personName: number, ... }]
    // teams: [{ name, color, members: [] }]
    // For each day, sum sales per team by summing sales for their members

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

    // Sort by date ascending
    result.sort((a, b) => (a.date > b.date ? 1 : -1));

    return result;
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

    return (
      <div>
        <Typography variant="h5" gutterBottom>
          Team Sales Over Time
        </Typography>
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
      </div>
    );
  }
}

export default CompetitionAndCharts;
