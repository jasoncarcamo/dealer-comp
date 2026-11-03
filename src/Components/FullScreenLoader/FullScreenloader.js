
import React, { Component } from "react";

import {
    Box,
    CircularProgress,
    Typography
} from "@mui/material";

import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";

import "./FullScreenLoader.css";

export default class FullScreenLoader extends Component {
    render() {
        const {
            message = "Loading..."
        } = this.props;

        return (
            <Box
                className="fullscreen-loader"
                role="status"
                aria-live="polite"
                aria-busy="true"
                aria-label={message}
            >
                <div className="fullscreen-loader-content">
                    <div className="fullscreen-loader-icon">
                        <DirectionsCarRoundedIcon />
                    </div>

                    <Typography
                        component="h2"
                        className="fullscreen-loader-title"
                    >
                        Sales Dashboard
                    </Typography>

                    <Typography
                        component="p"
                        className="fullscreen-loader-message"
                    >
                        {message}
                    </Typography>

                    <div className="fullscreen-loader-progress">
                        <CircularProgress
                            size={42}
                            thickness={4}
                            aria-hidden="true"
                        />
                    </div>

                    <div
                        className="fullscreen-loader-progress-track"
                        aria-hidden="true"
                    >
                        <span />
                    </div>

                    <Typography
                        component="p"
                        className="fullscreen-loader-footer"
                    >
                        Preparing your dashboard
                    </Typography>
                </div>
            </Box>
        );
    }
}
