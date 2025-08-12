import React, { Component } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

class NavBar extends Component {
  render() {
    return (
      <AppBar position="static" sx={{backgroundColor: '#EB0A1E'}}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Car Sales Competition Tracker
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default NavBar;
