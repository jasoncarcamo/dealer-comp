import React, { Component } from 'react';
import { Tabs, Tab } from '@mui/material';

class TabsMenu extends Component {
  render() {
    return (
      <Tabs
        value={this.props.value}
        onChange={this.props.onChange}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{
        ".Mui-selected": {
        color: `#EB0A1E`,
        },
        ".MuiTabs-centered": {
            borderBottomColor: "#EB0A1E"
        }
        }}
      >
        <Tab label="Manage Teams" />
        <Tab label="Enter Sales" />
        <Tab label="Competition" />
        <Tab label="History" />
      </Tabs>
    );
  }
}

export default TabsMenu;