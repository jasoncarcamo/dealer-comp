
import React, { Component } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container,
    Avatar,
    Chip
} from "@mui/material";

import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";

import "./NavBar.css";

class NavBar extends Component {
    render() {
        return (
            <AppBar
                position="sticky"
                elevation={0}
                className="competition-navbar"
            >
                <Container maxWidth="xl">
                    <Toolbar
                        disableGutters
                        className="competition-navbar-toolbar"
                    >
                        <Box className="competition-navbar-brand">
                            <Avatar className="competition-navbar-logo">
                                <DirectionsCarRoundedIcon />
                            </Avatar>

                            <Box className="competition-navbar-brand-text">
                                <Typography
                                    component="span"
                                    className="competition-navbar-eyebrow"
                                >
                                    SALES PERFORMANCE
                                </Typography>

                                <Typography
                                    component="h1"
                                    className="competition-navbar-title"
                                >
                                    Competition Tracker
                                </Typography>
                            </Box>
                        </Box>

                        <Box className="competition-navbar-actions">
                            <Chip
                                icon={<LeaderboardRoundedIcon />}
                                label="Sales Dashboard"
                                className="competition-navbar-chip"
                            />

                            <Box
                                className="competition-navbar-status"
                                aria-label="Competition dashboard"
                            >
                                <span className="competition-navbar-status-dot" />
                                <Typography component="span">
                                    Dashboard
                                </Typography>
                            </Box>
                        </Box>
                    </Toolbar>
                </Container>

                <Box className="competition-navbar-accent" />
            </AppBar>
        );
    }
}

export default NavBar;
