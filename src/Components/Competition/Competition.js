import React, { Component } from 'react';
import { Button } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Competition.css';

class Competition extends Component {
  render() {
    const { salesData, teams, addRandomSales } = this.props;

    return (
      <div className="competition-container">
        <Button
            variant="contained"
            onClick={addRandomSales}
            className="add-sales-button"
            size="large"
            >
            Add Random Sales
        </Button>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {teams.map(team => (
              <Line key={team.name} type="natural" dataKey={team.name} stroke={team.color} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default Competition;
