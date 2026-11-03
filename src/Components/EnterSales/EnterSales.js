
import React, { Component } from "react";

import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Snackbar,
    Alert
} from "@mui/material";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import "./EnterSales.css";

class EnterSales extends Component {
    constructor(props) {
        super(props);

        this.state = {
            date: this.getTodayDate(),
            salesInputs: {},
            originalSalesInputs: {},
            confirmOpen: false,
            dateConfirmOpen: false,
            pendingDate: null,
            saving: false,
            notification: {
                open: false,
                message: "",
                severity: "success"
            }
        };
    }

    componentDidMount() {
        this.loadSalesForDate(this.state.date);
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.salesData !== this.props.salesData ||
            prevProps.people !== this.props.people
        ) {
            if (!this.hasUnsavedChanges()) {
                this.loadSalesForDate(this.state.date);
            }
        }
    }

    getTodayDate = () => {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    normalizeDate = (value) => {
        if (!value) {
            return "";
        }

        if (typeof value === "string") {
            const match = value.match(/^\d{4}-\d{2}-\d{2}/);

            if (match) {
                return match[0];
            }
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    };

    getSalesEntry = (date) => {
        const { salesData = [] } = this.props;

        return salesData.find((entry) => {
            return this.normalizeDate(entry.date) === date;
        });
    };

    loadSalesForDate = (date) => {
        const { people = [] } = this.props;
        const entry = this.getSalesEntry(date);

        const salesInputs = {};

        people.forEach((person) => {
            const value = entry ? Number(entry[person.name]) : 0;

            salesInputs[person.name] = Number.isFinite(value)
                ? Math.max(0, value)
                : 0;
        });

        this.setState({
            date,
            salesInputs,
            originalSalesInputs: { ...salesInputs },
            confirmOpen: false
        });
    };

    hasUnsavedChanges = () => {
        const { salesInputs, originalSalesInputs } = this.state;
        const { people = [] } = this.props;

        return people.some((person) => {
            const current = Number(salesInputs[person.name] || 0);
            const original = Number(originalSalesInputs[person.name] || 0);

            return current !== original;
        });
    };

    handleDateChange = (event) => {
        const nextDate = event.target.value;

        if (!nextDate || nextDate === this.state.date) {
            return;
        }

        if (nextDate > this.getTodayDate()) {
            return;
        }

        if (this.hasUnsavedChanges()) {
            this.setState({
                pendingDate: nextDate,
                dateConfirmOpen: true
            });

            return;
        }

        this.loadSalesForDate(nextDate);
    };

    handleConfirmDateChange = () => {
        const { pendingDate } = this.state;

        this.setState({
            dateConfirmOpen: false,
            pendingDate: null
        });

        if (pendingDate) {
            this.loadSalesForDate(pendingDate);
        }
    };

    handleCancelDateChange = () => {
        this.setState({
            dateConfirmOpen: false,
            pendingDate: null
        });
    };

    handleSalesChange = (personName, value) => {
        if (value !== "" && !/^\d+$/.test(value)) {
            return;
        }

        const numericValue = value === "" ? 0 : Number(value);

        if (!Number.isSafeInteger(numericValue)) {
            return;
        }

        this.setState((previousState) => ({
            salesInputs: {
                ...previousState.salesInputs,
                [personName]: numericValue
            }
        }));
    };

    handleReset = () => {
        if (!this.hasUnsavedChanges()) {
            this.showNotification("There are no changes to discard.", "info");
            return;
        }

        this.setState((previousState) => ({
            salesInputs: { ...previousState.originalSalesInputs }
        }));

        this.showNotification("Unsaved changes discarded.", "info");
    };

    handleSaveClick = () => {
        if (!this.hasUnsavedChanges()) {
            this.showNotification("No changes have been made.", "info");
            return;
        }

        this.setState({
            confirmOpen: true
        });
    };

    handleConfirmSave = async () => {
        const { date, salesInputs } = this.state;
        const { salesData = [], people = [] } = this.props;

        const existingEntry = this.getSalesEntry(date);

        const newSale = {
            ...(existingEntry || {}),
            date
        };

        people.forEach((person) => {
            newSale[person.name] = Number(salesInputs[person.name] || 0);
        });

        const updatedSalesData = salesData
            .filter((entry) => {
                return this.normalizeDate(entry.date) !== date;
            })
            .concat(newSale)
            .sort((a, b) => {
                return this.normalizeDate(a.date).localeCompare(
                    this.normalizeDate(b.date)
                );
            });

        this.setState({
            saving: true,
            confirmOpen: false
        });

        try {
            await Promise.resolve(
                this.props.updateSalesData(updatedSalesData, newSale)
            );

            this.setState({
                originalSalesInputs: { ...salesInputs },
                saving: false
            });

            this.showNotification("Sales saved successfully.", "success");
        } catch (error) {
            this.setState({
                saving: false
            });

            this.showNotification(
                "Unable to save sales. Please try again.",
                "error"
            );
        }
    };

    showNotification = (message, severity = "success") => {
        this.setState({
            notification: {
                open: true,
                message,
                severity
            }
        });
    };

    handleCloseNotification = () => {
        this.setState((previousState) => ({
            notification: {
                ...previousState.notification,
                open: false
            }
        }));
    };

    getTotalSales = () => {
        const { people = [] } = this.props;
        const { salesInputs } = this.state;

        return people.reduce((total, person) => {
            return total + Number(salesInputs[person.name] || 0);
        }, 0);
    };

    getActiveSalespeople = () => {
        const { people = [] } = this.props;
        const { salesInputs } = this.state;

        return people.filter((person) => {
            return Number(salesInputs[person.name] || 0) > 0;
        }).length;
    };

    formatDisplayDate = (dateString) => {
        const [year, month, day] = dateString.split("-").map(Number);

        return new Date(year, month - 1, day).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    renderSummary = () => {
        const { people = [] } = this.props;

        return (
            <section
                className="enter-sales-summary"
                aria-label="Daily sales summary"
            >
                <article className="enter-sales-stat-card">
                    <div className="enter-sales-stat-icon">
                        <DirectionsCarRoundedIcon />
                    </div>

                    <div className="enter-sales-stat-content">
                        <span>Total Vehicles Sold</span>
                        <strong>{this.getTotalSales()}</strong>
                    </div>
                </article>

                <article className="enter-sales-stat-card">
                    <div className="enter-sales-stat-icon">
                        <GroupsRoundedIcon />
                    </div>

                    <div className="enter-sales-stat-content">
                        <span>Salespeople With Sales</span>
                        <strong>{this.getActiveSalespeople()}</strong>
                    </div>
                </article>

                <article className="enter-sales-stat-card">
                    <div className="enter-sales-stat-icon">
                        <CalendarMonthRoundedIcon />
                    </div>

                    <div className="enter-sales-stat-content">
                        <span>Total Salespeople</span>
                        <strong>{people.length}</strong>
                    </div>
                </article>
            </section>
        );
    };

    renderSalesTable = () => {
        const { people = [] } = this.props;
        const { salesInputs } = this.state;

        const sortedPeople = [...people].sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        return (
            <TableContainer
                component={Paper}
                elevation={0}
                className="enter-sales-table-container"
            >
                <Table
                    size="small"
                    stickyHeader
                    aria-label="Daily salesperson sales entry"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>Salesperson</TableCell>
                            <TableCell align="right">
                                Cars Sold
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {sortedPeople.map((person) => {
                            const count = Number(
                                salesInputs[person.name] || 0
                            );

                            return (
                                <TableRow key={person.id || person.name}>
                                    <TableCell>
                                        <div className="enter-sales-person">
                                            <div className="enter-sales-avatar">
                                                {person.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="enter-sales-person-details">
                                                <strong>
                                                    {person.name}
                                                </strong>

                                                <span>
                                                    Salesperson
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell align="right">
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={count === 0 ? "" : count}
                                            placeholder="0"
                                            disabled={this.state.saving}
                                            onChange={(event) => {
                                                this.handleSalesChange(
                                                    person.name,
                                                    event.target.value
                                                );
                                            }}
                                            inputProps={{
                                                min: 0,
                                                step: 1,
                                                inputMode: "numeric",
                                                "aria-label": `Cars sold by ${person.name}`
                                            }}
                                            className="enter-sales-number-input"
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {sortedPeople.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} align="center">
                                    <div className="enter-sales-empty">
                                        No salespeople have been added yet.
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    render() {
        const {
            date,
            confirmOpen,
            dateConfirmOpen,
            saving,
            notification
        } = this.state;

        const hasChanges = this.hasUnsavedChanges();

        return (
            <main className="enter-sales-page">
                <header className="enter-sales-header">
                    <div>
                        <span className="enter-sales-eyebrow">
                            SALES MANAGEMENT
                        </span>

                        <h1>Enter Daily Sales</h1>

                        <p>
                            Record each salesperson's vehicle sales
                            and keep your competition standings
                            up to date.
                        </p>
                    </div>

                    <Chip
                        label={hasChanges ? "Unsaved Changes" : "Up to Date"}
                        className={
                            hasChanges
                                ? "enter-sales-status enter-sales-status--unsaved"
                                : "enter-sales-status enter-sales-status--saved"
                        }
                    />
                </header>

                <section className="enter-sales-date-panel">
                    <div className="enter-sales-date-heading">
                        <div className="enter-sales-date-icon">
                            <CalendarMonthRoundedIcon />
                        </div>

                        <div>
                            <h2>Sales Date</h2>
                            <p>{this.formatDisplayDate(date)}</p>
                        </div>
                    </div>

                    <TextField
                        type="date"
                        size="small"
                        value={date}
                        onChange={this.handleDateChange}
                        disabled={saving}
                        inputProps={{
                            max: this.getTodayDate(),
                            "aria-label": "Select sales date"
                        }}
                        className="enter-sales-date-input"
                    />
                </section>

                {this.renderSummary()}

                <section className="enter-sales-entry-section">
                    <div className="enter-sales-section-heading">
                        <div>
                            <h2>Salesperson Entries</h2>

                            <p>
                                Enter the number of vehicles sold
                                by each salesperson.
                            </p>
                        </div>

                        <Chip
                            label={`${this.props.people.length} Salespeople`}
                            className="enter-sales-count-chip"
                        />
                    </div>

                    {this.renderSalesTable()}

                    <div className="enter-sales-footer">
                        <Typography
                            component="p"
                            className="enter-sales-footer-note"
                        >
                            {hasChanges
                                ? "You have changes that have not been saved."
                                : "All entries are up to date."}
                        </Typography>

                        <div className="enter-sales-actions">
                            <Button
                                variant="outlined"
                                startIcon={<RestartAltRoundedIcon />}
                                onClick={this.handleReset}
                                disabled={!hasChanges || saving}
                                className="enter-sales-reset-button"
                            >
                                Discard Changes
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<SaveRoundedIcon />}
                                onClick={this.handleSaveClick}
                                disabled={!hasChanges || saving}
                                className="enter-sales-save-button"
                            >
                                {saving ? "Saving..." : "Save Sales"}
                            </Button>
                        </div>
                    </div>
                </section>

                <Dialog
                    open={confirmOpen}
                    onClose={() => {
                        this.setState({ confirmOpen: false });
                    }}
                    fullWidth
                    maxWidth="xs"
                    className="enter-sales-dialog"
                >
                    <DialogTitle className="enter-sales-dialog-title">
                        Confirm Sales Entry
                    </DialogTitle>

                    <DialogContent>
                        <Typography>
                            Save the sales data for{" "}
                            <strong>
                                {this.formatDisplayDate(date)}
                            </strong>
                            ?
                        </Typography>

                        <Typography className="enter-sales-dialog-total">
                            Total vehicles: {this.getTotalSales()}
                        </Typography>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() => {
                                this.setState({ confirmOpen: false });
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={this.handleConfirmSave}
                            className="enter-sales-save-button"
                        >
                            Confirm Save
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={dateConfirmOpen}
                    onClose={this.handleCancelDateChange}
                    fullWidth
                    maxWidth="xs"
                    className="enter-sales-dialog"
                >
                    <DialogTitle>
                        Discard Unsaved Changes?
                    </DialogTitle>

                    <DialogContent>
                        <Typography>
                            You have unsaved sales entries.
                            Changing the date will discard them.
                        </Typography>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={this.handleCancelDateChange}>
                            Keep Editing
                        </Button>

                        <Button
                            variant="contained"
                            onClick={this.handleConfirmDateChange}
                            className="enter-sales-save-button"
                        >
                            Discard & Continue
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={notification.open}
                    autoHideDuration={3500}
                    onClose={this.handleCloseNotification}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center"
                    }}
                >
                    <Alert
                        severity={notification.severity}
                        onClose={this.handleCloseNotification}
                        variant="filled"
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </main>
        );
    }
}

export default EnterSales;
