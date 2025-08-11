import React, { Component } from 'react';
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Paper,
} from '@mui/material';

class EnterSales extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: this.getTodayDate(),
      salesInputs: {}, // { "personName": number }
    };
  }

  componentDidMount() {
    this.loadSalesForDate(this.state.date);
  }

  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  loadSalesForDate(date) {
    const { salesData, people } = this.props;
    // Find sales entry for this date, if exists
    const entry = salesData.find((d) => d.date === date);
    if (entry) {
      const salesInputs = {};
      people.forEach((p) => {
        salesInputs[p.name] = entry[p.name] || 0;
      });
      this.setState({ salesInputs });
    } else {
      // New date: zero out inputs
      const salesInputs = {};
      people.forEach((p) => {
        salesInputs[p.name] = 0;
      });
      this.setState({ salesInputs });
    }
  }

  handleDateChange = (e) => {
    const date = e.target.value;
    this.setState({ date });
    this.loadSalesForDate(date);
  };

  handleSalesChange = (personName, val) => {
    const numVal = Math.max(0, parseInt(val) || 0);
    this.setState((prev) => ({
      salesInputs: { ...prev.salesInputs, [personName]: numVal },
    }));
  };

  saveSales = () => {
    const { date, salesInputs } = this.state;
    let { salesData } = this.props;
    // Remove old entry for date if exists
    salesData = salesData.filter((d) => d.date !== date);
    // Add new entry with sales
    const newEntry = { date, ...salesInputs };
    salesData.push(newEntry);
    // Sort salesData by date ascending
    salesData.sort((a, b) => (a.date > b.date ? 1 : -1));
    this.props.updateSalesData(salesData);
    alert('Sales saved!');
  };

  render() {
    const { people } = this.props;
    const { date, salesInputs } = this.state;

    return (
      <div>
        <Typography variant="h5" gutterBottom>
          Enter Sales for Date
        </Typography>
        <TextField
          type="date"
          value={date}
          onChange={this.handleDateChange}
          sx={{ marginBottom: 2 }}
          inputProps={{ max: this.getTodayDate() }}
        />
        <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Salesperson</TableCell>
                <TableCell align="right">Cars Sold</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {people.map((person) => (
                <TableRow key={person.name}>
                  <TableCell>{person.name}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      inputProps={{ min: 0 }}
                      value={salesInputs[person.name] || 0}
                      onChange={(e) => this.handleSalesChange(person.name, e.target.value)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="contained" onClick={this.saveSales} sx={{ marginTop: 2 }}>
          Save Sales
        </Button>
      </div>
    );
  }
}

export default EnterSales;
