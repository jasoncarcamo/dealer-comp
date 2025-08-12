import React, { Component } from 'react';
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

class ManageTeamsAndPeople extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newTeamName: '',
      newTeamColor: '#1976d2',
      newPersonName: '',
      editingTeamIndex: null,
      editingTeamName: '',
      editingTeamColor: '#1976d2',
      addingTeam: false,
      addingPerson: false,
      addTeamNameInput: '',
      addTeamColorInput: '#1976d2',
      addPersonNameInput: '',
    };
  }

  onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const { teams, people } = this.props;

    const personToTeam = {};
    teams.forEach((team, i) => {
      if (team.members) {
        team.members.forEach((m) => {
          personToTeam[m] = i;
        });
      }
    });
    people.forEach((p) => {
      if (!personToTeam.hasOwnProperty(p.name)) personToTeam[p.name] = null;
    });

    const personName = draggableId;

    const sourceIsTeam = source.droppableId.startsWith('team-');
    const destIsTeam = destination.droppableId.startsWith('team-');

    if (source.droppableId === destination.droppableId) {
      if (sourceIsTeam) {
        const teamIndex = parseInt(source.droppableId.split('-')[1], 10);
        const team = teams[teamIndex];
        const newMembers = Array.from(team.members);
        newMembers.splice(source.index, 1);
        newMembers.splice(destination.index, 0, personName);
        this.props.updateTeamMembers(teamIndex, newMembers);
      }
    } else {
      if (personToTeam[personName] !== null) {
        const oldTeamIndex = personToTeam[personName];
        const oldTeam = teams[oldTeamIndex];
        const newMembers = oldTeam.members.filter((m) => m !== personName);
        this.props.updateTeamMembers(oldTeamIndex, newMembers);
      }
      if (destIsTeam) {
        const newTeamIndex = parseInt(destination.droppableId.split('-')[1], 10);
        const newTeam = teams[newTeamIndex];
        const newMembers = newTeam.members ? [...newTeam.members] : [];
        newMembers.splice(destination.index, 0, personName);
        this.props.updateTeamMembers(newTeamIndex, newMembers);
      }
    }
  };

  startAddingTeam = () => {
    this.setState({
      addingTeam: true,
      addTeamNameInput: '',
      addTeamColorInput: '#1976d2',
    });
  };

  cancelAddingTeam = () => {
    this.setState({ addingTeam: false, addTeamNameInput: '', addTeamColorInput: '#1976d2' });
  };

  saveAddingTeam = () => {
    const name = this.state.addTeamNameInput.trim();
    if (!name) return alert('Please enter a team name');
    const exists = this.props.teams.some(
      (team) => team.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return alert('Team name already exists.');
    this.props.addTeam({ name, color: this.state.addTeamColorInput, members: [] });
    this.setState({ addingTeam: false, addTeamNameInput: '', addTeamColorInput: '#1976d2' });
  };

  startAddingPerson = () => {
    this.setState({ addingPerson: true, addPersonNameInput: '' });
  };

  cancelAddingPerson = () => {
    this.setState({ addingPerson: false, addPersonNameInput: '' });
  };

  saveAddingPerson = () => {
    const name = this.state.addPersonNameInput.trim();
    if (!name) return alert('Please enter a person name');
    const exists = this.props.people.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return alert('Person already exists.');
    this.props.addPerson({ name, carsSold: 0 });
    this.setState({ addingPerson: false, addPersonNameInput: '' });
  };

  handleRemoveTeam = (teamIndex) => {
    const teamName = this.props.teams[teamIndex].name;
    if (window.confirm(`Are you sure you want to delete the team "${teamName}"?`)) {
      this.props.removeTeam(teamIndex);
    }
  };

  handleRemovePerson = (personName) => {
    const personIndex = this.props.people.findIndex(p => p.name === personName);
    if (personIndex === -1) return;

    if (window.confirm(`Are you sure you want to remove salesperson "${personName}"?`)) {
      this.props.removePerson(personIndex);
    }
  };

  startEditingTeam = (index, currentName, currentColor) => {
    this.setState({ editingTeamIndex: index, editingTeamName: currentName, editingTeamColor: currentColor });
  };

  cancelEditingTeam = () => {
    this.setState({ editingTeamIndex: null, editingTeamName: '', editingTeamColor: '#1976d2' });
  };

  saveEditingTeam = () => {
    const { editingTeamIndex, editingTeamName, editingTeamColor } = this.state;
    if (!editingTeamName.trim()) {
      alert('Team name cannot be empty.');
      return;
    }
    const nameExists = this.props.teams.some(
      (team, i) =>
        i !== editingTeamIndex &&
        team.name.toLowerCase() === editingTeamName.trim().toLowerCase()
    );
    if (nameExists) {
      alert('Another team with this name already exists.');
      return;
    }
    this.props.updateTeam(editingTeamIndex, { name: editingTeamName.trim(), color: editingTeamColor });
    this.setState({ editingTeamIndex: null, editingTeamName: '', editingTeamColor: '#1976d2' });
  };

  render() {
    const { teams, people } = this.props;
    const {
      editingTeamIndex,
      editingTeamName,
      editingTeamColor,
      addingTeam,
      addTeamNameInput,
      addTeamColorInput,
      addingPerson,
      addPersonNameInput,
    } = this.state;

    const assignedPeople = new Set();
    teams.forEach((team) => {
      if (team.members) team.members.forEach((m) => assignedPeople.add(m));
    });
    const unassignedPeople = people.filter((p) => !assignedPeople.has(p.name));

    const grid = 8;

    const getItemStyle = (isDragging, draggableStyle) => ({
      userSelect: 'none',
      padding: 1.5,
      marginBottom: 0,
      background: isDragging ? '#EB0A1E' : '#f36c78',
      borderRadius: 6,
      fontSize: '1.1rem',
      textAlign: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...draggableStyle,
    });

    const getListStyle = (isDraggingOver) => ({
      background: isDraggingOver ? '#bbdefb' : '#f5f5f5',
      padding: 6,
      minHeight: 50,
      maxHeight: 400,
      borderRadius: 6,
      border: '1px solid #EB0A1E',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 2.5,
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'thin',
      whiteSpace: 'normal',
    });

    const getTeamListStyle = (isDraggingOver) => ({
      background: isDraggingOver ? '#bbdefb' : '#f5f5f5',
      padding: 2,
      height: 400,
      borderRadius: 6,
      border: '1px solid',
      borderColor: '#1976d2',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      width: '100%',
      boxSizing: 'border-box',
      overflowY: 'auto',
      overflowX: 'hidden',
    });

    // Helper to get cars sold by a person from people prop
    const getCarsSold = (personName) => {
        const salesData = this.props.salesData;
        const people = this.props.people;
        let sellsCount = 0;
       
        for( let sell of salesData){
            for (const [key, value] of Object.entries(sell)) {
                if(personName === key && value > 0){
                    sellsCount = value;
                };
            };
        };

        return sellsCount;
    };

    return (
      <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3, fontSize: '1.25rem' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Manage Teams & Salespeople
        </Typography>

        {/* Add Team section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
          {!addingTeam ? (
            <Button
              variant="contained"
              onClick={this.startAddingTeam}
              sx={{ padding: '14px 24px', backgroundColor: '#EB0A1E'}}
            >
              Add New Team
            </Button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                this.saveAddingTeam();
              }}
              style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}
            >
              <TextField
                label="Team Name"
                size="medium"
                value={addTeamNameInput}
                onChange={(e) => this.setState({ addTeamNameInput: e.target.value })}
                sx={{ flex: 1 }}
                autoFocus
              />
              <input
                type="color"
                value={addTeamColorInput}
                onChange={(e) => this.setState({ addTeamColorInput: e.target.value })}
                style={{ width: 60, height: 40, border: 'none', cursor: 'pointer' }}
                aria-label="Choose team color"
              />
              <Button variant="contained" color="primary" type="submit">
                Save
              </Button>
              <Button variant="outlined" onClick={this.cancelAddingTeam} type="button">
                Cancel
              </Button>
            </form>
          )}
        </Box>

        {/* Add Person section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 6, alignItems: 'center' }}>
          {!addingPerson ? (
            <Button
              variant="contained"
              onClick={this.startAddingPerson}
              sx={{ padding: '14px 24px', backgroundColor: '#EB0A1E'}}
            >
              Add New Salesperson
            </Button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                this.saveAddingPerson();
              }}
              style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}
            >
              <TextField
                label="Salesperson Name"
                size="medium"
                value={addPersonNameInput}
                onChange={(e) => this.setState({ addPersonNameInput: e.target.value })}
                sx={{ flex: 1 }}
                autoFocus
              />
              <Button variant="contained" color="primary" type="submit">
                Save
              </Button>
              <Button variant="outlined" onClick={this.cancelAddingPerson} type="button">
                Cancel
              </Button>
            </form>
          )}
        </Box>

        <DragDropContext onDragEnd={this.onDragEnd}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Unassigned salespeople */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Unassigned Salespeople
              </Typography>
              <Droppable droppableId="unassigned" direction="horizontal">
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={getListStyle(snapshot.isDraggingOver)}
                    aria-label="Unassigned salespeople"
                  >
                    {unassignedPeople.length === 0 && (
                      <Typography sx={{ alignSelf: 'center', marginLeft: 2 }}>
                        No unassigned salespeople
                      </Typography>
                    )}
                    {unassignedPeople.map((person, index) => (
                      <Draggable key={person.name} draggableId={person.name} index={index}>
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                            aria-label={`Salesperson ${person.name}, sold ${person.carsSold || 0} cars`}
                          >
                            <span>{person.name} ({person.carsSold || 0} cars sold)</span>
                            <Button
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.handleRemovePerson(person.name);
                              }}
                              aria-label={`Remove salesperson ${person.name}`}
                            >
                              ×
                            </Button>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Box>

            {/* Teams in grid */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Teams
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                  gap: 3,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {teams.length === 0 && (
                  <Typography sx={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                    No teams added yet
                  </Typography>
                )}
                {teams.map((team, index) => (
                  <Droppable
                    key={team.name}
                    droppableId={`team-${index}`}
                    direction="vertical"
                  >
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          ...getTeamListStyle(snapshot.isDraggingOver),
                          borderColor: team.color,
                        }}
                        aria-label={`Team ${team.name} members list`}
                      >
                        <Box
                          sx={{
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: team.color,
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            userSelect: 'none',
                            gap: 1,
                          }}
                        >
                          {editingTeamIndex === index ? (
                            <>
                              <TextField
                                size="small"
                                value={editingTeamName}
                                onChange={(e) =>
                                  this.setState({ editingTeamName: e.target.value })
                                }
                                sx={{ flexGrow: 1, minWidth: 120 }}
                                aria-label={`Edit team name for ${team.name}`}
                              />
                              <input
                                type="color"
                                value={editingTeamColor}
                                onChange={(e) =>
                                  this.setState({ editingTeamColor: e.target.value })
                                }
                                style={{
                                  width: 40,
                                  height: 32,
                                  border: 'none',
                                  cursor: 'pointer',
                                  marginLeft: 8,
                                  borderRadius: 4,
                                }}
                                aria-label={`Edit color for ${team.name}`}
                              />
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={this.saveEditingTeam}
                                aria-label="Save team name and color"
                                sx={{ ml: 1 }}
                              >
                                Save
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="inherit"
                                onClick={this.cancelEditingTeam}
                                aria-label="Cancel editing team"
                                sx={{ ml: 1 }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <span
                                style={{ flex: 1, cursor: 'pointer' }}
                                onClick={() => this.startEditingTeam(index, team.name, team.color)}
                                title="Click to edit team name and color"
                              >
                                {team.name}
                              </span>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => this.handleRemoveTeam(index)}
                                aria-label={`Remove team ${team.name}`}
                              >
                                Remove
                              </Button>
                            </>
                          )}
                        </Box>

                        {team.members && team.members.length > 0 ? (
                          team.members.map((memberName, idx) => (
                            <Draggable
                              key={memberName}
                              draggableId={memberName}
                              index={idx}
                            >
                              {(provided, snapshot) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}
                                  aria-label={`${memberName} in team ${team.name}, sold ${getCarsSold(memberName)} cars`}
                                >
                                  {memberName} ({getCarsSold(memberName)} cars sold)
                                </Box>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <Typography sx={{ textAlign: 'center', mt: 2 }}>
                            No members assigned
                          </Typography>
                        )}

                        {provided.placeholder}
                      </Paper>
                    )}
                  </Droppable>
                ))}
              </Box>
            </Box>
          </Box>
        </DragDropContext>
      </Box>
    );
  }
}

export default ManageTeamsAndPeople;
