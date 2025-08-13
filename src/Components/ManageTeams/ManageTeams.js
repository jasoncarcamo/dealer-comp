import React, { Component } from 'react';
import { Typography } from '@mui/material';
import './ManageTeams.css';

class ManageTeams extends Component {
  render() {
    return (
        <div className="manage-teams">
            <Typography className="manage-teams-title" variant="h5">
                Manage Teams
            </Typography>
            <Typography className="manage-teams-placeholder" variant="body1">
                (Team management UI placeholder)
            </Typography>
        </div>
    );
  }
}

export default ManageTeams;
