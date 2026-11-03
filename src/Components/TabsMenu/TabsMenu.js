
import React, { Component } from "react";

import {
    Tabs,
    Tab,
    Box
} from "@mui/material";

import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import TokenService from "../../Services/StorageService/TokenService";

import "./TabsMenu.css";

export default class TabsMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isAuthenticated: Boolean(TokenService.getToken())
        };
    }

    componentDidUpdate() {
        const isAuthenticated = Boolean(TokenService.getToken());

        if (isAuthenticated !== this.state.isAuthenticated) {
            this.setState({
                isAuthenticated
            });
        }
    }

    handleChange = (event, newValue) => {
        if (this.props.onChange) {
            this.props.onChange(event, newValue);
        }
    };

    render() {
        const { value } = this.props;
        const { isAuthenticated } = this.state;

        return (
            <Box
                component="nav"
                className="tabs-menu"
                aria-label="Sales dashboard navigation"
            >
                <div className="tabs-menu-container">
                    <div className="tabs-menu-brand">
                        <span className="tabs-menu-brand-mark" />

                        <div>
                            <strong>Sales Dashboard</strong>
                            <span>Performance & Incentives</span>
                        </div>
                    </div>

                    <Tabs
                        value={value}
                        onChange={this.handleChange}
                        className="tabs-menu-tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        aria-label="Dashboard sections"
                    >
                        <Tab
                            value="bonuses"
                            label="Bonuses"
                            icon={<CardGiftcardRoundedIcon />}
                            iconPosition="start"
                            className="tabs-menu-tab"
                        />

                        {isAuthenticated && (
                            <Tab
                                value="manage-teams"
                                label="Manage Teams"
                                icon={<GroupsRoundedIcon />}
                                iconPosition="start"
                                className="tabs-menu-tab"
                            />
                        )}

                        {isAuthenticated && (
                            <Tab
                                value="enter-sales"
                                label="Enter Sales"
                                icon={<EditNoteRoundedIcon />}
                                iconPosition="start"
                                className="tabs-menu-tab"
                            />
                        )}

                        <Tab
                            value="competition"
                            label="Competition"
                            icon={<LeaderboardRoundedIcon />}
                            iconPosition="start"
                            className="tabs-menu-tab"
                        />

                        <Tab
                            value="history"
                            label="History"
                            icon={<HistoryRoundedIcon />}
                            iconPosition="start"
                            className="tabs-menu-tab"
                        />

                        {isAuthenticated ? (
                            <Tab
                                value="signout"
                                label="Sign Out"
                                icon={<LogoutRoundedIcon />}
                                iconPosition="start"
                                className="tabs-menu-tab tabs-menu-auth-tab"
                            />
                        ) : (
                            <Tab
                                value="login"
                                label="Log In"
                                icon={<LoginRoundedIcon />}
                                iconPosition="start"
                                className="tabs-menu-tab tabs-menu-auth-tab"
                            />
                        )}
                    </Tabs>
                </div>
            </Box>
        );
    }
}
