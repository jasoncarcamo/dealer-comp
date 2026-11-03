
import React, { Component } from "react";

import {
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from "@mui/material";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";

import TokenService from "../../../Services/StorageService/TokenService";

import "./BonusesList.css";

export default class BonusesList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            expandedMonths: {},
            editingId: null,
            editCriteria: "",
            editAmount: "",
            editStart: "",
            editEnd: "",
            newlyAddedId: props.newlyAddedId || null,
            deleteConfirmOpen: false,
            bonusToDelete: null,
            validationError: "",
            saving: false
        };
    }

    componentDidMount() {
        this.expandNewBonus();
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.newlyAddedId &&
            (
                prevProps.newlyAddedId !== this.props.newlyAddedId ||
                prevProps.bonuses !== this.props.bonuses
            )
        ) {
            this.expandNewBonus();
        }
    }

    getLocalDateKey = (date) => {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
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

        return this.getLocalDateKey(date);
    };

    formatDate = (value) => {
        const normalized = this.normalizeDate(value);

        if (!normalized) {
            return "Invalid date";
        }

        const [year, month, day] = normalized.split("-").map(Number);

        return new Date(year, month - 1, day).toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    };

    getMonthKey = (bonus) => {
        return this.normalizeDate(bonus.start_date).slice(0, 7);
    };

    expandNewBonus = () => {
        const { newlyAddedId, bonuses = [] } = this.props;

        if (!newlyAddedId) {
            return;
        }

        const bonus = bonuses.find((item) => {
            return String(item.id) === String(newlyAddedId);
        });

        if (!bonus) {
            return;
        }

        const monthKey = this.getMonthKey(bonus);

        if (
            this.state.expandedMonths[monthKey] &&
            String(this.state.newlyAddedId) === String(newlyAddedId)
        ) {
            return;
        }

        this.setState((previousState) => ({
            expandedMonths: {
                ...previousState.expandedMonths,
                [monthKey]: true
            },
            newlyAddedId
        }));
    };

    toggleMonth = (monthKey) => {
        this.setState((previousState) => ({
            expandedMonths: {
                ...previousState.expandedMonths,
                [monthKey]: !previousState.expandedMonths[monthKey]
            }
        }));
    };

    groupByMonth = (bonuses = []) => {
        const groups = {};

        bonuses.forEach((bonus) => {
            const key = this.getMonthKey(bonus);

            if (!/^\d{4}-\d{2}$/.test(key)) {
                return;
            }

            if (!groups[key]) {
                groups[key] = [];
            }

            groups[key].push(bonus);
        });

        return groups;
    };

    getMonthLabel = (monthKey) => {
        const [year, month] = monthKey.split("-").map(Number);

        return new Date(year, month - 1, 1).toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );
    };

    canEditBonus = (bonus) => {
        const today = this.getLocalDateKey(new Date());
        const endDate = this.normalizeDate(bonus.end_date);

        return Boolean(TokenService.getToken()) &&
            endDate >= today;
    };

    canDeleteBonus = (bonus) => {
        return Boolean(TokenService.getToken()) &&
            !this.props.past_bonuses &&
            this.normalizeDate(bonus.end_date) >=
                this.getLocalDateKey(new Date());
    };

    startEdit = (bonus) => {
        if (!this.canEditBonus(bonus)) {
            return;
        }

        this.setState({
            editingId: bonus.id,
            editCriteria: bonus.criteria || "",
            editAmount: String(bonus.amount || ""),
            editStart: this.normalizeDate(bonus.start_date),
            editEnd: this.normalizeDate(bonus.end_date),
            validationError: ""
        });
    };

    handleEditChange = (field, value) => {
        this.setState({
            [field]: value,
            validationError: ""
        });
    };

    validateEdit = () => {
        const {
            editCriteria,
            editAmount,
            editStart,
            editEnd
        } = this.state;

        if (!editCriteria.trim()) {
            return "Please enter the bonus criteria.";
        }

        const amount = Number(editAmount);

        if (
            editAmount === "" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return "Bonus amount must be greater than zero.";
        }

        if (!editStart || !editEnd) {
            return "Please select both dates.";
        }

        if (editStart > editEnd) {
            return "The end date cannot be before the start date.";
        }

        if (editEnd < this.getLocalDateKey(new Date())) {
            return "The bonus end date cannot be in the past.";
        }

        return "";
    };

    saveEdit = async () => {
        const error = this.validateEdit();

        if (error) {
            this.setState({
                validationError: error
            });

            return;
        }

        const {
            editingId,
            editCriteria,
            editAmount,
            editStart,
            editEnd
        } = this.state;

        const originalBonus = (this.props.bonuses || []).find(
            (bonus) => String(bonus.id) === String(editingId)
        );

        const updatedBonus = {
            ...(originalBonus || {}),
            id: editingId,
            criteria: editCriteria.trim(),
            amount: Number(editAmount),
            start_date: editStart,
            end_date: editEnd
        };

        this.setState({
            saving: true
        });

        try {
            await Promise.resolve(
                this.props.onSaveEdit(updatedBonus)
            );

            this.setState({
                editingId: null,
                saving: false,
                validationError: ""
            });
        } catch (error) {
            this.setState({
                saving: false,
                validationError: "Unable to save changes. Please try again."
            });
        }
    };

    cancelEdit = () => {
        this.setState({
            editingId: null,
            validationError: "",
            saving: false
        });
    };

    openDeleteConfirmation = (bonus) => {
        if (!this.canDeleteBonus(bonus)) {
            return;
        }

        this.setState({
            deleteConfirmOpen: true,
            bonusToDelete: bonus
        });
    };

    closeDeleteConfirmation = () => {
        this.setState({
            deleteConfirmOpen: false,
            bonusToDelete: null
        });
    };

    confirmDelete = async () => {
        const { bonusToDelete } = this.state;

        if (!bonusToDelete) {
            return;
        }

        this.setState({
            saving: true
        });

        try {
            await Promise.resolve(
                this.props.onRemove(bonusToDelete.id)
            );

            this.setState({
                deleteConfirmOpen: false,
                bonusToDelete: null,
                saving: false
            });
        } catch (error) {
            this.setState({
                saving: false
            });
        }
    };

    clearHighlight = () => {
        if (this.state.newlyAddedId !== null) {
            this.setState({
                newlyAddedId: null
            });
        }
    };

    renderEditForm = (bonus) => {
        const {
            editCriteria,
            editAmount,
            editStart,
            editEnd,
            validationError,
            saving
        } = this.state;

        return (
            <div
                key={bonus.id}
                className="bonus-item bonus-item--editing"
            >
                <div className="bonus-edit-header">
                    <h4>Edit Bonus</h4>

                    <Button
                        size="small"
                        onClick={this.cancelEdit}
                        disabled={saving}
                        aria-label="Cancel editing"
                    >
                        <CloseRoundedIcon fontSize="small" />
                    </Button>
                </div>

                <div className="bonus-edit-fields">
                    <TextField
                        label="Bonus Criteria"
                        value={editCriteria}
                        onChange={(event) => {
                            this.handleEditChange(
                                "editCriteria",
                                event.target.value
                            );
                        }}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                    />

                    <TextField
                        label="Bonus Amount ($)"
                        type="number"
                        value={editAmount}
                        onChange={(event) => {
                            this.handleEditChange(
                                "editAmount",
                                event.target.value
                            );
                        }}
                        size="small"
                        fullWidth
                        inputProps={{
                            min: 0.01,
                            step: 0.01
                        }}
                    />

                    <TextField
                        label="Start Date"
                        type="date"
                        value={editStart}
                        onChange={(event) => {
                            this.handleEditChange(
                                "editStart",
                                event.target.value
                            );
                        }}
                        size="small"
                        fullWidth
                        InputLabelProps={{
                            shrink: true
                        }}
                    />

                    <TextField
                        label="End Date"
                        type="date"
                        value={editEnd}
                        onChange={(event) => {
                            this.handleEditChange(
                                "editEnd",
                                event.target.value
                            );
                        }}
                        size="small"
                        fullWidth
                        InputLabelProps={{
                            shrink: true
                        }}
                    />
                </div>

                {validationError && (
                    <p className="bonus-validation-error" role="alert">
                        {validationError}
                    </p>
                )}

                <div className="bonus-edit-actions">
                    <Button
                        variant="outlined"
                        onClick={this.cancelEdit}
                        disabled={saving}
                        className="bonus-cancel-button"
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<SaveRoundedIcon />}
                        onClick={this.saveEdit}
                        disabled={saving}
                        className="bonus-save-button"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        );
    };

    renderBonus = (bonus) => {
        const { editingId, newlyAddedId } = this.state;

        if (String(editingId) === String(bonus.id)) {
            return this.renderEditForm(bonus);
        }

        const isNew = (
            newlyAddedId !== null &&
            String(newlyAddedId) === String(bonus.id)
        );

        const canEdit = this.canEditBonus(bonus);
        const canDelete = this.canDeleteBonus(bonus);
        const canManage = Boolean(TokenService.getToken());

        return (
            <article
                key={bonus.id}
                className={`bonus-item ${isNew ? "bonus-item--new" : ""}`}
                onClick={this.clearHighlight}
            >
                <div className="bonus-header">
                    <div className="bonus-title-area">
                        <div className="bonus-gift-icon">
                            <CardGiftcardRoundedIcon />
                        </div>

                        <h4>{bonus.criteria}</h4>
                    </div>

                    {canManage && (canEdit || canDelete) && (
                        <div className="bonus-actions">
                            {canEdit && (
                                <Button
                                    size="small"
                                    startIcon={<EditOutlinedIcon />}
                                    onClick={() => this.startEdit(bonus)}
                                    className="bonus-edit-button"
                                >
                                    Edit
                                </Button>
                            )}

                            {canDelete && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        this.openDeleteConfirmation(bonus);
                                    }}
                                    className="bonus-delete-button"
                                    aria-label={`Delete bonus: ${bonus.criteria}`}
                                >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <div className="bonus-details">
                    <div className="bonus-amount">
                        <span>Bonus Amount</span>

                        <strong>
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD"
                            }).format(Number(bonus.amount || 0))}
                        </strong>
                    </div>

                    <div className="bonus-date-range">
                        <CalendarMonthRoundedIcon />

                        <span>
                            {this.formatDate(bonus.start_date)}
                            {" — "}
                            {this.formatDate(bonus.end_date)}
                        </span>
                    </div>
                </div>

                {isNew && (
                    <Chip
                        label="Newly Added"
                        size="small"
                        className="bonus-new-chip"
                    />
                )}
            </article>
        );
    };

    render() {
        const { bonuses = [] } = this.props;
        const {
            expandedMonths,
            deleteConfirmOpen,
            bonusToDelete,
            saving
        } = this.state;

        const grouped = this.groupByMonth(bonuses);

        const monthKeys = Object.keys(grouped).sort((a, b) => {
            return b.localeCompare(a);
        });

        return (
            <div className="bonuses-list">
                {monthKeys.length === 0 && (
                    <div className="bonuses-list-empty">
                        <CardGiftcardRoundedIcon />

                        <h3>No Bonuses Available</h3>

                        <p>
                            There are no bonuses to display
                            in this section.
                        </p>
                    </div>
                )}

                {monthKeys.map((monthKey) => {
                    const monthBonuses = [...grouped[monthKey]].sort(
                        (a, b) => {
                            return String(b.date_created || "").localeCompare(
                                String(a.date_created || "")
                            );
                        }
                    );

                    const isExpanded = Boolean(
                        expandedMonths[monthKey]
                    );

                    const label = this.getMonthLabel(monthKey);

                    return (
                        <section
                            key={monthKey}
                            className={`bonus-month-group ${isExpanded ? "bonus-month-group--expanded" : ""}`}
                        >
                            <button
                                type="button"
                                className="bonus-month-header"
                                onClick={() => {
                                    this.toggleMonth(monthKey);
                                }}
                                aria-expanded={isExpanded}
                                aria-controls={`bonus-month-${monthKey}`}
                            >
                                <div className="bonus-month-title">
                                    <span className="bonus-month-icon">
                                        <CalendarMonthRoundedIcon />
                                    </span>

                                    <div>
                                        <h3>{label}</h3>

                                        <span>
                                            {monthBonuses.length}{" "}
                                            {monthBonuses.length === 1
                                                ? "Bonus"
                                                : "Bonuses"}
                                        </span>
                                    </div>
                                </div>

                                <div className="bonus-month-right">
                                    <Chip
                                        label={monthBonuses.length}
                                        size="small"
                                        className="bonus-month-count"
                                    />

                                    {isExpanded ? (
                                        <KeyboardArrowDownRoundedIcon />
                                    ) : (
                                        <KeyboardArrowRightRoundedIcon />
                                    )}
                                </div>
                            </button>

                            <div
                                id={`bonus-month-${monthKey}`}
                                className="bonus-month-content"
                                hidden={!isExpanded}
                            >
                                {isExpanded && monthBonuses.map(
                                    (bonus) => this.renderBonus(bonus)
                                )}
                            </div>
                        </section>
                    );
                })}

                <Dialog
                    open={deleteConfirmOpen}
                    onClose={saving ? undefined : this.closeDeleteConfirmation}
                    fullWidth
                    maxWidth="xs"
                    className="bonus-delete-dialog"
                >
                    <DialogTitle>
                        Delete Sales Bonus?
                    </DialogTitle>

                    <DialogContent>
                        <p>
                            Are you sure you want to delete{" "}
                            <strong>
                                {bonusToDelete
                                    ? bonusToDelete.criteria
                                    : "this bonus"}
                            </strong>
                            ?
                        </p>

                        <p>
                            This action cannot be undone.
                        </p>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={this.closeDeleteConfirmation}
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={this.confirmDelete}
                            disabled={saving}
                            className="bonus-confirm-delete-button"
                        >
                            {saving ? "Deleting..." : "Delete Bonus"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
