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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

class EnterSales extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: this.getTodayDate(),
      salesInputs: {}, // { "personName": number }
      originalSalesInputs: {},
      confirmOpen: false,
    };
  }

  componentDidMount() {
    this.loadSalesForDate(this.state.date);
  }

  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  };

  loadSalesForDate(date) {
    const { salesData, people } = this.props;
    const entry = salesData.find((d) => 
      new Date(d.date).toISOString().split('T')[0] === date
    );

    console.log(entry)

    const salesInputs = {};
    people.forEach((p) => {
      salesInputs[p.name] = entry ? entry[p.name] || 0 : 0;
    });

    if(!entry){
      this.setState({ salesInputs: {}, originalSalesInputs: {} });
      return;
    }

    if(entry.id){
      salesInputs.id = entry.id;
    }

    if(entry.date){
      salesInputs.date = entry.date;
    }

    this.setState({ salesInputs, originalSalesInputs: { ...salesInputs } });
  };

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

  handleSaveClick = () => {
    this.setState({ confirmOpen: true });
  };

  handleConfirmSave = () => {
    const { date, salesInputs } = this.state;
    let { salesData } = this.props;
    salesData = salesData.filter((d) => d.date !== date);
    const newSale = { date, ...salesInputs };
    console.log(newSale)
    if(!newSale.hasOwnProperty("id")){
      salesData.push(newSale);
    };

    salesData.sort((a, b) => (a.date > b.date ? 1 : -1));

    this.props.updateSalesData(salesData, newSale);
    
    this.setState({ originalSalesInputs: salesInputs, confirmOpen: false });
    alert('Sales saved!');
  };

  handleCancel = () => {
    this.setState((prev) => ({
      salesInputs: { ...prev.originalSalesInputs },
      confirmOpen: false,
    }));
  };

  render() {
    const { people } = this.props;
    const { date, salesInputs, confirmOpen } = this.state;

    console.log(salesInputs)

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
              {[...people]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((person) => (
                  <TableRow key={person.name}>
                    <TableCell>{person.name}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={salesInputs[person.name] || ""}
                        onChange={(e) => this.handleSalesChange(person.name, e.target.value)}
                        size="small"
                        inputProps={{
                          min: 0,
                          style: { textAlign: "right" },
                          inputMode: "numeric",
                          pattern: "[0-9]*"
                        }}
                        sx={{
                          "& input": {
                            paddingRight: "6px",
                          },
                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0
                          },
                          "& input[type=number]": {
                            MozAppearance: "textfield"
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="contained"
          onClick={this.handleSaveClick}
          sx={{ marginTop: 2, marginRight: 2, minWidth: 100 }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          onClick={this.handleCancel}
          sx={{ marginTop: 2, minWidth: 100 }}
        >
          Cancel
        </Button>

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => this.setState({ confirmOpen: false })}>
          <DialogTitle>Confirm Save</DialogTitle>
          <DialogContent>
            Are you sure you want to save the sales data for {date}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ confirmOpen: false })}>No</Button>
            <Button onClick={this.handleConfirmSave} variant="contained" autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default EnterSales;
