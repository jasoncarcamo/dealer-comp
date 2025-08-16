import React, { Component } from 'react';
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import "./ManageTeamsAndPeople.css"

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
    const date = new Date();

    if (!name) return alert('Please enter a team name');
    const exists = this.props.teams.some(
      (team) => team.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return alert('Team name already exists.');
    this.props.addTeam({ name, color: this.state.addTeamColorInput, members: [], date});
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

    const getItemStyle = (isDragging, draggableStyle) => ({
      userSelect: 'none',
      padding: 1.5,
      marginBottom: 0,
      background: isDragging ? '#EB0A1E' : '#fde7e9',
      borderRadius: 6,
      fontSize: '1.1rem',
      textAlign: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
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
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
      },
      gap: 0,
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

    const getCarsSold = (personName) => {
      const salesData = this.props.salesData;
      let sellsCount = 0;
      console.log(salesData)

      for (const sale of salesData) {
        console.log(sale)
        for (const [key, value] of Object.entries(sale)) {
          console.log(key, sale[key])
          if (personName === key) {
            const date = new Date();
            const currentMonth = date.getMonth();
            const sellDate = new Date(sale.date);
            console.log(currentMonth, sellDate.getMonth())
            if (sellDate.getMonth() === currentMonth) {
              sellsCount += Number(sale[key]);
              console.log(sellsCount);
            }
          }
        }
      }
      return sellsCount;
    };

    return (
      <Box
        sx={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: 3,
          fontSize: '1.25rem',
          overflowX: 'hidden',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Manage Teams & Salespeople
        </Typography>

        {/* Add Team section */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 4,
            alignItems: 'center',
            flexWrap: 'wrap',
            '& > button': {
              minWidth: 120,
            },
            '@media (max-width: 620px)': {
              gap: 1,
              '& > button': {
                flexGrow: 1,
                minWidth: 100,
              },
            },
          }}
        >
          {!addingTeam ? (
            <Button variant="contained" onClick={this.startAddingTeam} sx={{ padding: '14px 24px', backgroundColor: '#EB0A1E' }}>
              Add New Team
            </Button>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); this.saveAddingTeam(); }}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flex: 1,
                flexWrap: 'wrap',
                minWidth: 0,
              }}
            >
              <TextField
                label="Team name"
                size="medium"
                value={addTeamNameInput}
                onChange={(e) => this.setState({ addTeamNameInput: e.target.value })}
                autoFocus
                sx={{
                  flex: '1 1 150px',
                  minWidth: 0,
                  maxWidth: '100%',
                  '& .MuiInputLabel-root': { color: 'gray' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#EB0A1E !important' },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#EB0A1E' },
                  },
                }}
              />
              <input
                type="color"
                value={addTeamColorInput}
                onChange={(e) => this.setState({ addTeamColorInput: e.target.value })}
                style={{
                  width: "32px",
                  height: "32px",
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  borderRadius: 4,
                }}
              />
              <Button variant="contained" type="submit" sx={{ backgroundColor: '#EB0A1E', flexShrink: 0, minWidth: 75, whiteSpace: 'nowrap' }}>Save</Button>
              <Button variant="outlined" onClick={this.cancelAddingTeam} type="button" sx={{ flexShrink: 0, minWidth: 75, whiteSpace: 'nowrap' }}>Cancel</Button>
            </form>
          )}
        </Box>

        {/* Add Person section */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 6,
            alignItems: 'center',
            flexWrap: 'wrap',
            '& > button': {
              minWidth: 120,
            },
            '@media (max-width: 620px)': {
              gap: 1,
              '& > button': {
                flexGrow: 1,
                minWidth: 100,
              },
            },
          }}
        >
          {!addingPerson ? (
            <Button variant="contained" onClick={this.startAddingPerson} sx={{ padding: '14px 24px', backgroundColor: '#EB0A1E' }}>
              Add New Salesperson
            </Button>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); this.saveAddingPerson(); }}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flex: 1,
                flexWrap: 'wrap',
                minWidth: 0,
              }}
            >
              <TextField
                label="Salesperson Name"
                size="medium"
                value={addPersonNameInput}
                onChange={(e) => this.setState({ addPersonNameInput: e.target.value })}
                autoFocus
                sx={{
                  flex: '1 1 150px',
                  minWidth: 0,
                  maxWidth: '100%',
                  '& .MuiInputLabel-root': { color: 'gray' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#EB0A1E !important' },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#EB0A1E' },
                  },
                }}
                variant="outlined"
              />
              <Button variant="contained" type="submit" sx={{ backgroundColor: '#EB0A1E', flexShrink: 0, minWidth: 75, whiteSpace: 'nowrap' }}>Save</Button>
              <Button variant="outlined" onClick={this.cancelAddingPerson} type="button" sx={{ flexShrink: 0, minWidth: 75, whiteSpace: 'nowrap' }}>Cancel</Button>
            </form>
          )}
        </Box>

        <DragDropContext onDragEnd={this.onDragEnd}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, overflowX: 'hidden' }}>
            {/* Unassigned salespeople */}
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 'bold', overflowWrap: 'break-word', wordBreak: 'break-word' }}
              >
                Unassigned Salespeople
              </Typography>
              <Droppable droppableId="unassigned" direction="vertical">
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      ...getListStyle(snapshot.isDraggingOver),
                      overflowX: 'hidden',
                      maxWidth: '100%',
                      minHeight: "350px",
                      boxSizing: 'border-box',
                      marginBottom: 0,
                      paddingTop: "20px !important",
                    }}
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
                            sx={{
                              ...getItemStyle(snapshot.isDragging, provided.draggableProps.style),
                              width: '90%',
                              height: "50px",
                              margin: '0 auto 4px auto',
                              paddingLeft: "15px !important"
                            }}
                          >
                            <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                              {person.name} ({person.carsSold || 0} cars sold)
                            </span>
                            <Button
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.handleRemovePerson(person.name);
                              }}
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
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                Teams
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(220px, 1fr))',
                  },
                  gap: 2,
                  width: '100%',
                  boxSizing: 'border-box',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {teams.length === 0 && (
                  <Typography sx={{ gridColumn: '1 / -1', textAlign: 'center' }}>No teams added yet</Typography>
                )}
                {teams.map((team, index) => (
                  <Droppable key={team.name} droppableId={`team-${index}`} direction="vertical">
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          ...getTeamListStyle(snapshot.isDraggingOver),
                          borderColor: team.color,
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                          padding: ".5em .75em 0 .75em !important"
                        }}
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
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            flexWrap: 'wrap',
                          }}
                        >
                          {editingTeamIndex === index ? (
                            <>
                              <TextField
                                value={editingTeamName}
                                onChange={(e) => this.setState({ editingTeamName: e.target.value })}
                                size="small"
                                sx={{ flexGrow: 1, minWidth: '6rem' }}
                                inputProps={{ maxLength: 30 }}
                              />
                              <input
                                type="color"
                                value={editingTeamColor}
                                onChange={(e) => this.setState({ editingTeamColor: e.target.value })}
                                style={{ width: 30, height: 30, border: 'none', cursor: 'pointer' }}
                              />
                              <Button size="small" onClick={this.saveEditingTeam} sx={{ color: team.color }}>
                                Save
                              </Button>
                              <Button size="small" onClick={this.cancelEditingTeam} sx={{ color: team.color }}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <span>{team.name}</span>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                <Button
                                  size="small"
                                  sx={{ color: team.color, minWidth: 30, padding: '4px 8px' }}
                                  onClick={() => this.startEditingTeam(index, team.name, team.color)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  sx={{ color: team.color, minWidth: 30, padding: '4px 8px' }}
                                  onClick={() => this.handleRemoveTeam(index)}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </>
                          )}
                        </Box>

                        {team.members && team.members.length > 0 ? (
                          team.members.map((memberName, memberIndex) => {
                            const member = people.find((p) => p.name === memberName);
                            const carsSold = member ? getCarsSold(member.name) : 0;
                            return (
                              <Draggable
                                key={memberName}
                                draggableId={memberName}
                                index={memberIndex}
                              >
                                {(provided, snapshot) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{
                                      ...getItemStyle(snapshot.isDragging, provided.draggableProps.style),
                                      width: '100%',
                                      height: "50px",
                                      marginBottom: '2px',
                                      boxSizing: 'border-box',
                                      paddingLeft: "15px !important"
                                    }}
                                  >
                                    <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                      {memberName} ({carsSold} cars sold)
                                    </span>
                                    <Button
                                      size="small"
                                      color="error"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        this.handleRemovePerson(memberName);
                                      }}
                                    >
                                      ×
                                    </Button>
                                  </Box>
                                )}
                              </Draggable>
                            );
                          })
                        ) : (
                          <Typography sx={{ color: '#888', fontStyle: 'italic', padding: '8px' }}>
                            No members in this team
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
