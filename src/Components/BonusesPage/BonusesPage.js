
import React, { Component } from "react";

import {
    Button,
    Chip,
    CircularProgress
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import BonusesList from "./BonusesList/BonusesList";
import BonusForm from "./BonusesForm/BonusesForm";
import ConfirmationMessage from "../ConfrimationMessage/ConfirmationMessage";

import FetchBonuses from "../../Services/FetchServices/FetchBonuses";
import BonusesStorage from "../../Services/StorageService/BonusesStorage";
import TokenService from "../../Services/StorageService/TokenService";

import "./BonusesPage.css";

export default class BonusesPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bonuses: this.getStoredBonuses(),
            editingBonus: null,
            confirmationVisible: false,
            confirmationMessage: "",
            showForm: false,
            expandList: false,
            newlyAddedId: null,
            loading: false,
            error: ""
        };
    }

    componentDidMount() {
        const stored = this.getStoredBonuses();

        console.log(stored)
        
        if (!stored || Object.keys(stored).length === 0) {
            this.setState({
                loading: true
            });
        }

        this.setState({
            bonuses: this.getStoredBonuses()
        });
    }

    componentDidUpdate(prevProps) {

        if(this.state.loading){
            this.setState({
                loading: false
            });
        }
    }

    getStoredBonuses = () => {
        try {
            const stored = BonusesStorage.getBonuses();

            if (!stored) {
                return {};
            }

            const parsed = typeof stored === "string"
                ? JSON.parse(stored)
                : stored;

            return parsed && typeof parsed === "object"
                ? parsed
                : {};
        } catch (error) {
            console.error("Unable to read stored bonuses:", error);
            return {};
        }
    };

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

    
    getAllBonuses = () => {
        const bonuses = this.getStoredBonuses()

        if (Array.isArray(bonuses)) {
            return bonuses.filter(Boolean);
        }

        if (!bonuses || typeof bonuses !== "object") {
            return [];
        }

        const result = [];

        Object.values(bonuses).forEach((months) => {
            if (!months || typeof months !== "object") {
                return;
            }

            Object.values(months).forEach((monthBonuses) => {
                if (Array.isArray(monthBonuses)) {
                    result.push(...monthBonuses);
                }
            });
        });

        return result.filter(Boolean);
    };


    getCategorizedBonuses = () => {
        const today = this.getLocalDateKey(new Date());
        const allBonuses = this.getAllBonuses();

        const current = [];
        const upcoming = [];
        const past = [];

        allBonuses.forEach((bonus) => {
            const startDate = this.normalizeDate(bonus.start_date);
            const endDate = this.normalizeDate(bonus.end_date);

            if (!startDate || !endDate) {
                return;
            }

            if (endDate < today) {
                past.push(bonus);
            } else if (startDate > today) {
                upcoming.push(bonus);
            } else {
                current.push(bonus);
            }
        });

        current.sort((a, b) => {
            return this.normalizeDate(a.end_date).localeCompare(
                this.normalizeDate(b.end_date)
            );
        });

        upcoming.sort((a, b) => {
            return this.normalizeDate(a.start_date).localeCompare(
                this.normalizeDate(b.start_date)
            );
        });

        past.sort((a, b) => {
            return this.normalizeDate(b.end_date).localeCompare(
                this.normalizeDate(a.end_date)
            );
        });

        return {
            current,
            upcoming,
            past
        };
    };

    toggleForm = () => {
        this.setState((previousState) => ({
            showForm: !previousState.showForm,
            editingBonus: previousState.showForm
                ? null
                : previousState.editingBonus
        }));
    };

    onCloseConfirmation = () => {
        this.setState({
            confirmationVisible: false,
            confirmationMessage: ""
        });
    };

    showConfirmation = (message) => {
        this.setState({
            confirmationVisible: true,
            confirmationMessage: message
        });
    };

    expandLists = () => {
        this.setState({
            expandList: true
        });
    };

    toggleExpandList = () => {
        this.setState((previousState) => ({
            expandList: !previousState.expandList
        }));
    };

    
    addBonus = async (bonus) => {
        this.setState({
            loading: true,
            error: ""
        });

        try {
            const saved = await FetchBonuses.createBonus(bonus);

            if (!saved || !saved.createdBonus) {
                throw new Error("The server did not return the new bonus.");
            }

            const createdBonus = saved.createdBonus;

            const updated = BonusesStorage.addBonus(createdBonus);

            if (updated !== undefined) {
                BonusesStorage.saveBonuses(updated);
            }

            this.setState({
                bonuses: this.getStoredBonuses(),
                loading: false,
                showForm: false,
                editingBonus: null,
                expandList: true,
                newlyAddedId: createdBonus.id
            });

            this.showConfirmation("Bonus added successfully!");

        } catch (error) {
            console.error("Error adding bonus:", error);

            this.setState({
                loading: false,
                error: "Unable to add bonus. Please try again."
            });

            throw error;
        }
    };


    removeBonus = async (id) => {
        this.setState({
            loading: true,
            error: ""
        });

        try {
            const response = await FetchBonuses.deleteBonusById(id);

            if (!response || !response.deletedBonus) {
                throw new Error("The server did not confirm deletion.");
            }

            BonusesStorage.deleteBonus(response.deletedBonus);

            this.setState({
                bonuses: this.getStoredBonuses(),
                loading: false,
                newlyAddedId: null
            });

            this.showConfirmation("Bonus removed successfully.");
        } catch (error) {
            console.error("Error removing bonus:", error);

            this.setState({
                loading: false,
                error: "Unable to remove bonus. Please try again."
            });
        }
    };

    startEdit = (bonus) => {
        this.setState({
            editingBonus: bonus,
            showForm: true,
            error: ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    saveEdit = async (updatedBonus) => {
        this.setState({
            loading: true,
            error: ""
        });

        try {
            const response = await FetchBonuses.patchBonusById(
                updatedBonus,
                updatedBonus.id
            );

            BonusesStorage.editBonus(response);

            this.setState({
                bonuses: this.getStoredBonuses(),
                editingBonus: null,
                showForm: false,
                loading: false,
                newlyAddedId: null
            });

            this.showConfirmation("Bonus updated successfully.");
        } catch (error) {
            console.error("Error updating bonus:", error);

            this.setState({
                loading: false,
                error: "Unable to update bonus. Please try again."
            });
        }
    };

    cancelEdit = () => {
        this.setState({
            editingBonus: null,
            showForm: false
        });
    };

    renderSummary = (categorized) => {
        const cards = [
            {
                label: "Active Bonuses",
                value: categorized.current.length,
                icon: <CardGiftcardRoundedIcon />
            },
            {
                label: "Upcoming Bonuses",
                value: categorized.upcoming.length,
                icon: <CalendarMonthRoundedIcon />
            },
            {
                label: "Past Bonuses",
                value: categorized.past.length,
                icon: <HistoryRoundedIcon />
            }
        ];

        return (
            <section
                className="bonuses-summary"
                aria-label="Bonus overview"
            >
                {cards.map((card) => (
                    <article
                        className="bonuses-stat-card"
                        key={card.label}
                    >
                        <div className="bonuses-stat-icon">
                            {card.icon}
                        </div>

                        <div className="bonuses-stat-content">
                            <span>{card.label}</span>
                            <strong>{card.value}</strong>
                        </div>
                    </article>
                ))}
            </section>
        );
    };

    renderBonusSection = (title, description, bonuses, type) => {
        const {
            newlyAddedId,
            expandList
        } = this.state;

        return (
            <section
                className="bonuses-section"
                aria-labelledby={`bonuses-${type}-title`}
            >
                <div className="bonuses-section-header">
                    <div>
                        <h2 id={`bonuses-${type}-title`}>
                            {title}
                        </h2>

                        <p>{description}</p>
                    </div>

                    <Chip
                        label={`${bonuses.length} Bonuses`}
                        className="bonuses-count-chip"
                    />
                </div>

                <div className="bonuses-list-panel">
                    <BonusesList
                        newlyAddedId={newlyAddedId}
                        bonuses={bonuses}
                        onRemove={this.removeBonus}
                        onEdit={this.startEdit}
                        onSaveEdit={this.saveEdit}
                        expandList={expandList}
                        expandLists={this.expandLists}
                        toggleExpandList={this.toggleExpandList}
                        current_bonuses={type === "current"}
                        past_bonuses={type === "past"}
                    />
                </div>
            </section>
        );
    };

    render() {
        const {
            editingBonus,
            showForm,
            loading,
            error
        } = this.state;

        const categorized = this.getCategorizedBonuses();
        const canManage = Boolean(TokenService.getToken());

        return (
            <main className="bonuses-page">
                <ConfirmationMessage
                    message={this.state.confirmationMessage}
                    visible={this.state.confirmationVisible}
                    onClose={this.onCloseConfirmation}
                />

                <header className="bonuses-page-header">
                    <div>
                        <span className="bonuses-eyebrow">
                            SALES INCENTIVES
                        </span>

                        <h1>Sales Bonuses</h1>

                        <p>
                            Stay informed about active incentives,
                            upcoming opportunities, and previous
                            sales bonuses.
                        </p>
                    </div>

                    {canManage && (
                        <Button
                            variant="contained"
                            startIcon={
                                showForm
                                    ? <CloseRoundedIcon />
                                    : <AddRoundedIcon />
                            }
                            onClick={this.toggleForm}
                            disabled={loading}
                            className="bonuses-primary-button"
                        >
                            {showForm ? "Close Form" : "Add New Bonus"}
                        </Button>
                    )}
                </header>

                {error && (
                    <div
                        className="bonuses-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {showForm && canManage && (
                    <section className="bonuses-form-section">
                        <div className="bonuses-form-header">
                            <div>
                                <h2>
                                    {editingBonus
                                        ? "Edit Sales Bonus"
                                        : "Create Sales Bonus"}
                                </h2>

                                <p>
                                    {editingBonus
                                        ? "Update the selected incentive."
                                        : "Enter the details for a new incentive."}
                                </p>
                            </div>
                        </div>

                        <BonusForm
                            onAdd={this.addBonus}
                            onSaveEdit={this.saveEdit}
                            editingBonus={editingBonus}
                            onCancel={this.cancelEdit}
                        />
                    </section>
                )}

                {loading && (
                    <div className="bonuses-loading" role="status">
                        <CircularProgress size={20} />
                        <span>Processing bonus...</span>
                    </div>
                )}

                {this.renderSummary(categorized)}

                {this.renderBonusSection(
                    "Current Bonuses",
                    "Incentives available during today's date.",
                    categorized.current,
                    "current"
                )}

                {this.renderBonusSection(
                    "Past Bonuses",
                    "Previously offered sales incentives.",
                    categorized.past,
                    "past"
                )}
            </main>
        );
    }
}
