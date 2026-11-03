
import React, { Component } from "react";
import {
    Box,
    Button,
    Chip,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import ConfirmationMessage from "../ConfrimationMessage/ConfirmationMessage";
import "./ManageTeamsAndPeople.css";

class ManageTeamsAndPeople extends Component {
    constructor(props) {
        super(props);

        this.state = {
            addingTeam: false,
            addTeamNameInput: "",
            addTeamColorInput: "#EB0A1E",
            addingPerson: false,
            addPersonNameInput: "",
            editingTeamId: null,
            editingTeamName: "",
            editingTeamColor: "#EB0A1E",
            editingPerson: null,
            editedName: "",
            nameError: "",
            message: "",
            showMessage: false
        };
    }

    getCurrentTeams = () => {
        const { teams = [] } = this.props;
        const now = new Date();

        return teams
            .filter((team) => {
                const date = new Date(team.date);

                return (
                    !Number.isNaN(date.getTime()) &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                );
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    };

    getMonthlySales = (personName) => {
        const { salesData = [] } = this.props;
        const now = new Date();

        return salesData.reduce((total, sale) => {
            const date = new Date(sale.date);

            if (
                Number.isNaN(date.getTime()) ||
                date.getMonth() !== now.getMonth() ||
                date.getFullYear() !== now.getFullYear()
            ) {
                return total;
            }

            const count = Number(sale[personName] || 0);

            return total + (Number.isFinite(count) ? count : 0);
        }, 0);
    };

    getUnassignedPeople = (currentTeams) => {
        const { people = [] } = this.props;

        const assigned = new Set(
            currentTeams.reduce((names, team) => {
                return names.concat(team.members || []);
            }, [])
        );

        return people
            .filter((person) => !assigned.has(person.name))
            .sort((a, b) => a.name.localeCompare(b.name));
    };

    showMessage = (message) => {
        this.setState({
            message,
            showMessage: true
        });
    };

    closeMessage = () => {
        this.setState({
            showMessage: false
        });
    };

    startAddingTeam = () => {
        this.setState({
            addingTeam: true,
            addTeamNameInput: "",
            addTeamColorInput: "#EB0A1E"
        });
    };

    cancelAddingTeam = () => {
        this.setState({
            addingTeam: false,
            addTeamNameInput: ""
        });
    };

    saveAddingTeam = () => {
        const name = this.state.addTeamNameInput.trim();
        const { teams = [] } = this.props;

        if (!name) {
            this.showMessage("Please enter a team name.");
            return;
        }

        const exists = teams.some((team) => {
            return team.name.toLowerCase() === name.toLowerCase();
        });

        if (exists) {
            this.showMessage("A team with this name already exists.");
            return;
        }

        this.props.addTeam({
            name,
            color: this.state.addTeamColorInput,
            members: [],
            date: new Date()
        });

        this.setState({
            addingTeam: false,
            addTeamNameInput: ""
        });

        this.showMessage("Team added successfully.");
    };

    startAddingPerson = () => {
        this.setState({
            addingPerson: true,
            addPersonNameInput: ""
        });
    };

    cancelAddingPerson = () => {
        this.setState({
            addingPerson: false,
            addPersonNameInput: ""
        });
    };

    saveAddingPerson = () => {
        const name = this.state.addPersonNameInput.trim();
        const { people = [] } = this.props;

        if (!name) {
            this.showMessage("Please enter a salesperson name.");
            return;
        }

        const exists = people.some((person) => {
            return person.name.toLowerCase() === name.toLowerCase();
        });

        if (exists) {
            this.showMessage("This salesperson already exists.");
            return;
        }

        this.props.addPerson({
            name,
            carsSold: 0
        });

        this.setState({
            addingPerson: false,
            addPersonNameInput: ""
        });

        this.showMessage("Salesperson added successfully.");
    };

    startEditingTeam = (team) => {
        this.setState({
            editingTeamId: team.id,
            editingTeamName: team.name,
            editingTeamColor: team.color || "#EB0A1E"
        });
    };

    cancelEditingTeam = () => {
        this.setState({
            editingTeamId: null,
            editingTeamName: ""
        });
    };

    saveEditingTeam = (team) => {
        const name = this.state.editingTeamName.trim();
        const { teams = [] } = this.props;

        if (!name) {
            this.showMessage("Team name cannot be empty.");
            return;
        }

        const exists = teams.some((item) => {
            return (
                item.id !== team.id &&
                item.name.toLowerCase() === name.toLowerCase()
            );
        });

        if (exists) {
            this.showMessage("A team with this name already exists.");
            return;
        }

        const index = teams.findIndex((item) => item.id === team.id);

        if (index === -1) {
            return;
        }

        this.props.updateTeam(index, {
            ...team,
            name,
            color: this.state.editingTeamColor
        });

        this.cancelEditingTeam();
        this.showMessage("Team updated successfully.");
    };

    handleRemoveTeam = (team) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${team.name}"?`
        );

        if (!confirmed) {
            return;
        }

        this.props.removeTeam(team);
    };

    handleRemovePerson = (personName) => {
        const { people = [], teams = [] } = this.props;

        const personIndex = people.findIndex((person) => {
            return person.name === personName;
        });

        if (personIndex === -1) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to remove "${personName}"?`
        );

        if (!confirmed) {
            return;
        }

        teams.forEach((team, index) => {
            if ((team.members || []).includes(personName)) {
                this.props.updateTeamMembers(
                    index,
                    team.members.filter((name) => name !== personName)
                );
            }
        });

        this.props.removePerson(personIndex);
    };

    handleRemoveFromTeam = (personName, teamId) => {
        const { teams = [] } = this.props;

        const index = teams.findIndex((team) => team.id === teamId);

        if (index === -1) {
            return;
        }

        const members = (teams[index].members || []).filter((name) => {
            return name !== personName;
        });

        this.props.updateTeamMembers(index, members);
    };

    handleAssignToTeam = (personName, teamId) => {
        const { teams = [] } = this.props;
        const currentTeams = this.getCurrentTeams();

        const target = currentTeams.find((team) => team.id === teamId);

        if (!target) {
            return;
        }

        const updates = [];

        currentTeams.forEach((team) => {
            const index = teams.findIndex((item) => item.id === team.id);

            if (index === -1) {
                return;
            }

            const members = (team.members || []).filter((name) => {
                return name !== personName;
            });

            if (team.id === teamId) {
                members.push(personName);
            }

            const original = team.members || [];

            if (
                members.length !== original.length ||
                members.some((name, i) => name !== original[i])
            ) {
                updates.push({ index, members });
            }
        });

        updates.forEach(({ index, members }) => {
            this.props.updateTeamMembers(index, members);
        });
    };

    validateName = (newName, oldName) => {
        const name = newName.trim();

        if (!name) {
            return "Name cannot be empty.";
        }

        const exists = (this.props.people || []).some((person) => {
            return (
                person.name.toLowerCase() === name.toLowerCase() &&
                person.name !== oldName
            );
        });

        return exists ? "Name already exists." : "";
    };

    startEditingPerson = (person) => {
        this.setState({
            editingPerson: person.name,
            editedName: person.name,
            nameError: ""
        });
    };

    handleCancelEdit = () => {
        this.setState({
            editingPerson: null,
            editedName: "",
            nameError: ""
        });
    };

    handleSaveName = async (person) => {
        const newName = this.state.editedName.trim();
        const error = this.validateName(newName, person.name);

        if (error) {
            this.setState({ nameError: error });
            return;
        }

        if (newName === person.name) {
            this.handleCancelEdit();
            return;
        }

        const updatedPerson = {
            ...person,
            name: newName
        };

        try {
            const result = await this.props.editPerson(
                updatedPerson,
                person.id
            );

            const savedPerson = result || updatedPerson;

            if (this.props.saveEditedPerson) {
                this.props.saveEditedPerson(savedPerson);
            }

            const { teams = [] } = this.props;

            teams.forEach((team, index) => {
                if ((team.members || []).includes(person.name)) {
                    const members = team.members.map((name) => {
                        return name === person.name ? newName : name;
                    });

                    this.props.updateTeamMembers(index, members);
                }
            });

            this.handleCancelEdit();
            this.showMessage("Salesperson updated successfully.");
        } catch (error) {
            this.showMessage("Unable to update salesperson.");
        }
    };

    renderPerson = (person, currentTeamId = null) => {
        const {
            editingPerson,
            editedName,
            nameError
        } = this.state;

        const isEditing = editingPerson === person.name;
        const currentTeams = this.getCurrentTeams();
        const carsSold = this.getMonthlySales(person.name);

        return (
            <div className="tracker-person" key={person.name}>
                <div className="tracker-person-details">
                    <div className="tracker-person-avatar">
                        {person.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="tracker-person-info">
                        {isEditing ? (
                            <TextField
                                size="small"
                                label="Salesperson name"
                                value={editedName}
                                error={Boolean(nameError)}
                                helperText={nameError}
                                onChange={(event) => {
                                    const value = event.target.value;

                                    this.setState({
                                        editedName: value,
                                        nameError: this.validateName(
                                            value,
                                            person.name
                                        )
                                    });
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        this.handleSaveName(person);
                                    }

                                    if (event.key === "Escape") {
                                        this.handleCancelEdit();
                                    }
                                }}
                            />
                        ) : (
                            <>
                                <strong>{person.name}</strong>
                                <span>
                                    {carsSold} {carsSold === 1 ? "car" : "cars"} sold
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="tracker-person-actions">
                    {isEditing ? (
                        <>
                            <IconButton
                                aria-label={`Save ${person.name}`}
                                onClick={() => this.handleSaveName(person)}
                                disabled={Boolean(nameError)}
                            >
                                <SaveRoundedIcon />
                            </IconButton>

                            <IconButton
                                aria-label="Cancel editing"
                                onClick={this.handleCancelEdit}
                            >
                                <CloseRoundedIcon />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            <Select
                                size="small"
                                value=""
                                displayEmpty
                                aria-label={`Assign ${person.name} to a team`}
                                onChange={(event) => {
                                    this.handleAssignToTeam(
                                        person.name,
                                        event.target.value
                                    );
                                }}
                                className="tracker-team-select"
                            >
                                <MenuItem value="" disabled>
                                    {currentTeamId ? "Move" : "Assign"}
                                </MenuItem>

                                {currentTeams.map((team) => (
                                    <MenuItem
                                        key={team.id}
                                        value={team.id}
                                        disabled={team.id === currentTeamId}
                                    >
                                        {team.name}
                                    </MenuItem>
                                ))}
                            </Select>

                            {currentTeamId && (
                                <Button
                                    size="small"
                                    className="tracker-unassign-button"
                                    onClick={() => {
                                        this.handleRemoveFromTeam(
                                            person.name,
                                            currentTeamId
                                        );
                                    }}
                                >
                                    Unassign
                                </Button>
                            )}

                            <IconButton
                                aria-label={`Edit ${person.name}`}
                                onClick={() => this.startEditingPerson(person)}
                            >
                                <EditOutlinedIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                                aria-label={`Delete ${person.name}`}
                                className="tracker-delete-icon"
                                onClick={() => this.handleRemovePerson(person.name)}
                            >
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        </>
                    )}
                </div>
            </div>
        );
    };

    renderTeam = (team) => {
        const { people = [] } = this.props;
        const isEditing = this.state.editingTeamId === team.id;
        const members = [...(team.members || [])].sort();

        const teamSales = members.reduce((total, name) => {
            return total + this.getMonthlySales(name);
        }, 0);

        return (
            <article
                className="tracker-team-card"
                key={team.id}
                style={{ "--team-color": team.color || "#EB0A1E" }}
            >
                <div className="tracker-team-card-header">
                    {isEditing ? (
                        <div className="tracker-team-edit">
                            <TextField
                                size="small"
                                label="Team name"
                                value={this.state.editingTeamName}
                                onChange={(event) => {
                                    this.setState({
                                        editingTeamName: event.target.value
                                    });
                                }}
                            />

                            <input
                                type="color"
                                aria-label="Team color"
                                value={this.state.editingTeamColor}
                                onChange={(event) => {
                                    this.setState({
                                        editingTeamColor: event.target.value
                                    });
                                }}
                            />

                            <Button onClick={() => this.saveEditingTeam(team)}>
                                Save
                            </Button>

                            <Button onClick={this.cancelEditingTeam}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="tracker-team-heading">
                                <span className="tracker-team-color" />

                                <div>
                                    <h3>{team.name}</h3>
                                    <span>
                                        {members.length} members
                                    </span>
                                </div>
                            </div>

                            <div className="tracker-team-header-actions">
                                <IconButton
                                    aria-label={`Edit ${team.name}`}
                                    onClick={() => this.startEditingTeam(team)}
                                >
                                    <EditOutlinedIcon fontSize="small" />
                                </IconButton>

                                <IconButton
                                    aria-label={`Delete ${team.name}`}
                                    onClick={() => this.handleRemoveTeam(team)}
                                >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                            </div>
                        </>
                    )}
                </div>

                <div className="tracker-team-summary">
                    <span>Monthly Team Sales</span>
                    <strong>{teamSales}</strong>
                </div>

                <div className="tracker-team-members">
                    {members.length === 0 ? (
                        <div className="tracker-empty-members">
                            No salespeople assigned yet.
                        </div>
                    ) : (
                        members.map((name) => {
                            const person = people.find((item) => {
                                return item.name === name;
                            });

                            return this.renderPerson(
                                person || { name },
                                team.id
                            );
                        })
                    )}
                </div>
            </article>
        );
    };

    render() {
        const { people = [] } = this.props;
        const currentTeams = this.getCurrentTeams();
        const unassigned = this.getUnassignedPeople(currentTeams);

        const {
            addingTeam,
            addTeamNameInput,
            addTeamColorInput,
            addingPerson,
            addPersonNameInput
        } = this.state;

        const monthLabel = new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });

        return (
            <main className="tracker-manage-page">
                <ConfirmationMessage
                    message={this.state.message}
                    visible={this.state.showMessage}
                    onClose={this.closeMessage}
                />

                <header className="tracker-page-header">
                    <div>
                        <span className="tracker-page-eyebrow">
                            COMPETITION MANAGEMENT
                        </span>

                        <h1>Teams & Salespeople</h1>

                        <p>
                            Organize your sales teams, manage your
                            roster, and track monthly performance.
                        </p>
                    </div>

                    <Chip
                        label={monthLabel}
                        className="tracker-month-chip"
                    />
                </header>

                <section
                    className="tracker-stats"
                    aria-label="Competition overview"
                >
                    <div className="tracker-stat-card">
                        <div className="tracker-stat-icon">
                            <GroupsRoundedIcon />
                        </div>

                        <div>
                            <span>Active Teams</span>
                            <strong>{currentTeams.length}</strong>
                        </div>
                    </div>

                    <div className="tracker-stat-card">
                        <div className="tracker-stat-icon">
                            <PersonOutlineRoundedIcon />
                        </div>

                        <div>
                            <span>Salespeople</span>
                            <strong>{people.length}</strong>
                        </div>
                    </div>

                    <div className="tracker-stat-card">
                        <div className="tracker-stat-icon">
                            <PersonOutlineRoundedIcon />
                        </div>

                        <div>
                            <span>Unassigned</span>
                            <strong>{unassigned.length}</strong>
                        </div>
                    </div>
                </section>

                <section className="tracker-management-section">
                    <div className="tracker-section-header">
                        <div>
                            <h2>Manage Your Roster</h2>
                            <p>
                                Create teams and add salespeople to
                                the competition.
                            </p>
                        </div>
                    </div>

                    <div className="tracker-management-grid">
                        <div className="tracker-action-card">
                            <h3>Add a Team</h3>

                            {addingTeam ? (
                                <form
                                    className="tracker-action-form"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        this.saveAddingTeam();
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Team name"
                                        value={addTeamNameInput}
                                        onChange={(event) => {
                                            this.setState({
                                                addTeamNameInput: event.target.value
                                            });
                                        }}
                                    />

                                    <label className="tracker-color-label">
                                        Team Color

                                        <input
                                            type="color"
                                            value={addTeamColorInput}
                                            onChange={(event) => {
                                                this.setState({
                                                    addTeamColorInput: event.target.value
                                                });
                                            }}
                                        />
                                    </label>

                                    <div className="tracker-form-actions">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            className="tracker-primary-button"
                                        >
                                            Save Team
                                        </Button>

                                        <Button onClick={this.cancelAddingTeam}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <Button
                                    variant="contained"
                                    startIcon={<AddRoundedIcon />}
                                    className="tracker-primary-button"
                                    onClick={this.startAddingTeam}
                                >
                                    Add New Team
                                </Button>
                            )}
                        </div>

                        <div className="tracker-action-card">
                            <h3>Add a Salesperson</h3>

                            {addingPerson ? (
                                <form
                                    className="tracker-action-form"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        this.saveAddingPerson();
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Salesperson name"
                                        value={addPersonNameInput}
                                        onChange={(event) => {
                                            this.setState({
                                                addPersonNameInput: event.target.value
                                            });
                                        }}
                                    />

                                    <div className="tracker-form-actions">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            className="tracker-primary-button"
                                        >
                                            Save Salesperson
                                        </Button>

                                        <Button onClick={this.cancelAddingPerson}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <Button
                                    variant="contained"
                                    startIcon={<AddRoundedIcon />}
                                    className="tracker-primary-button"
                                    onClick={this.startAddingPerson}
                                >
                                    Add New Salesperson
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="tracker-management-section">
                    <div className="tracker-section-header">
                        <div>
                            <h2>Unassigned Salespeople</h2>
                            <p>
                                Assign available salespeople to a team.
                            </p>
                        </div>

                        <span className="tracker-count">
                            {unassigned.length} Available
                        </span>
                    </div>

                    <div className="tracker-unassigned-panel">
                        {unassigned.length === 0 ? (
                            <div className="tracker-empty-state">
                                Everyone has been assigned to a team.
                            </div>
                        ) : (
                            <div className="tracker-unassigned-grid">
                                {unassigned.map((person) => {
                                    return this.renderPerson(person);
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <section className="tracker-management-section">
                    <div className="tracker-section-header">
                        <div>
                            <h2>Competition Teams</h2>
                            <p>
                                Manage team members and monitor sales.
                            </p>
                        </div>

                        <span className="tracker-count">
                            {currentTeams.length} Teams
                        </span>
                    </div>

                    {currentTeams.length === 0 ? (
                        <div className="tracker-empty-state">
                            No teams have been created for this month.
                        </div>
                    ) : (
                        <div className="tracker-teams-grid">
                            {currentTeams.map(this.renderTeam)}
                        </div>
                    )}
                </section>
            </main>
        );
    }
}

export default ManageTeamsAndPeople;
