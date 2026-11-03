
import React, { Component } from "react";

import {
    Button,
    TextField,
    InputAdornment,
    CircularProgress
} from "@mui/material";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";

import "./BonusesForm.css";

export default class BonusForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.getInitialFields(props.editingBonus),
            error: "",
            submitting: false
        };
    }

    getInitialFields = (bonus) => {
        if (!bonus) {
            return {
                criteria: "",
                amount: "",
                startDate: "",
                endDate: ""
            };
        }

        return {
            criteria: bonus.criteria || "",
            amount: String(bonus.amount ?? ""),
            startDate: this.normalizeDate(bonus.start_date),
            endDate: this.normalizeDate(bonus.end_date)
        };
    };

    componentDidUpdate(prevProps) {
        if (prevProps.editingBonus !== this.props.editingBonus) {
            this.setState({
                ...this.getInitialFields(this.props.editingBonus),
                error: "",
                submitting: false
            });
        }
    }

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

    handleChange = (event) => {
        const { name, value } = event.target;

        this.setState({
            [name]: value,
            error: ""
        });
    };

    validate = () => {
        const {
            criteria,
            amount,
            startDate,
            endDate
        } = this.state;

        if (!criteria.trim()) {
            return "Please enter the bonus criteria.";
        }

        if (
            amount === "" ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return "Bonus amount must be greater than zero.";
        }

        if (!startDate || !endDate) {
            return "Please select both a start date and an end date.";
        }

        if (startDate > endDate) {
            return "The start date cannot be after the end date.";
        }

        return "";
    };

    handleSubmit = async (event) => {
        event.preventDefault();

        if (this.state.submitting) {
            return;
        }

        const error = this.validate();

        if (error) {
            this.setState({ error });
            return;
        }

        const { editingBonus, onAdd, onSaveEdit } = this.props;

        const {
            criteria,
            amount,
            startDate,
            endDate
        } = this.state;

        const bonus = {
            ...(editingBonus || {}),
            criteria: criteria.trim(),
            amount: Number(amount),
            start_date: startDate,
            end_date: endDate
        };

        if (editingBonus) {
            bonus.id = editingBonus.id;
        } else {
            bonus.date_created = new Date().toISOString();
        }

        this.setState({
            submitting: true,
            error: ""
        });

        try {
            if (editingBonus) {
                await Promise.resolve(onSaveEdit(bonus));
            } else {
                await Promise.resolve(onAdd(bonus));
            }

            this.setState({
                criteria: "",
                amount: "",
                startDate: "",
                endDate: "",
                submitting: false,
                error: ""
            });
        } catch (error) {
            console.error("Unable to save bonus:", error);

            this.setState({
                submitting: false,
                error: "Unable to save bonus. Please try again."
            });
        }
    };

    handleCancel = () => {
        if (this.state.submitting) {
            return;
        }

        this.setState({
            ...this.getInitialFields(null),
            error: ""
        });

        if (this.props.onCancel) {
            this.props.onCancel();
        }
    };

    render() {
        const editing = Boolean(this.props.editingBonus);

        const {
            criteria,
            amount,
            startDate,
            endDate,
            error,
            submitting
        } = this.state;

        return (
            <form
                className="bonus-form"
                onSubmit={this.handleSubmit}
                noValidate
            >
                <div className="bonus-form-intro">
                    <div className="bonus-form-intro-icon">
                        {editing ? (
                            <SaveRoundedIcon />
                        ) : (
                            <AddRoundedIcon />
                        )}
                    </div>

                    <div>
                        <h3>
                            {editing
                                ? "Update Bonus Details"
                                : "New Bonus Details"}
                        </h3>

                        <p>
                            Complete the fields below to{" "}
                            {editing
                                ? "update the existing incentive."
                                : "create a new sales incentive."}
                        </p>
                    </div>
                </div>

                {error && (
                    <div
                        className="bonus-form-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="bonus-form-grid">
                    <div className="bonus-form-field bonus-form-field--full">
                        <label htmlFor="bonus-criteria">
                            Bonus Criteria
                            <span aria-hidden="true">*</span>
                        </label>

                        <TextField
                            id="bonus-criteria"
                            name="criteria"
                            value={criteria}
                            onChange={this.handleChange}
                            placeholder="e.g. Sell 10 vehicles this month"
                            multiline
                            minRows={3}
                            fullWidth
                            size="small"
                            disabled={submitting}
                            required
                            inputProps={{
                                maxLength: 1000
                            }}
                        />

                        <p className="bonus-form-helper">
                            Describe what a salesperson must achieve
                            to earn this bonus.
                        </p>
                    </div>

                    <div className="bonus-form-field bonus-form-field--full">
                        <label htmlFor="bonus-amount">
                            Bonus Amount
                            <span aria-hidden="true">*</span>
                        </label>

                        <TextField
                            id="bonus-amount"
                            type="number"
                            name="amount"
                            value={amount}
                            onChange={this.handleChange}
                            placeholder="0.00"
                            fullWidth
                            size="small"
                            disabled={submitting}
                            required
                            inputProps={{
                                min: 0.01,
                                step: 0.01,
                                inputMode: "decimal"
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AttachMoneyRoundedIcon
                                            fontSize="small"
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>

                    <div className="bonus-form-field">
                        <label htmlFor="bonus-start-date">
                            Start Date
                            <span aria-hidden="true">*</span>
                        </label>

                        <TextField
                            id="bonus-start-date"
                            type="date"
                            name="startDate"
                            value={startDate}
                            onChange={this.handleChange}
                            fullWidth
                            size="small"
                            disabled={submitting}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarMonthRoundedIcon
                                            fontSize="small"
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>

                    <div className="bonus-form-field">
                        <label htmlFor="bonus-end-date">
                            End Date
                            <span aria-hidden="true">*</span>
                        </label>

                        <TextField
                            id="bonus-end-date"
                            type="date"
                            name="endDate"
                            value={endDate}
                            onChange={this.handleChange}
                            fullWidth
                            size="small"
                            disabled={submitting}
                            required
                            inputProps={{
                                min: startDate || undefined
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarMonthRoundedIcon
                                            fontSize="small"
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                </div>

                <div className="bonus-form-footer">
                    <p>
                        Fields marked with{" "}
                        <strong>*</strong> are required.
                    </p>

                    <div className="bonus-form-actions">
                        <Button
                            type="button"
                            variant="outlined"
                            startIcon={<CloseRoundedIcon />}
                            onClick={this.handleCancel}
                            disabled={submitting}
                            className="bonus-form-cancel-button"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                            startIcon={
                                submitting ? (
                                    <CircularProgress
                                        size={16}
                                        color="inherit"
                                    />
                                ) : editing ? (
                                    <SaveRoundedIcon />
                                ) : (
                                    <AddRoundedIcon />
                                )
                            }
                            className="bonus-form-submit-button"
                        >
                            {submitting
                                ? "Saving..."
                                : editing
                                    ? "Save Changes"
                                    : "Add Bonus"}
                        </Button>
                    </div>
                </div>
            </form>
        );
    }
}
