import React, { Component } from 'react';
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  MenuItem,
  Select
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
      editingTeamColor: '',
      addingTeam: false,
      addingPerson: false,
      addTeamNameInput: '',
      addTeamColorInput: '#1976d2',
      addPersonNameInput: '',
    };
  }

  getPersonToTeamMap = () => {
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
      if (!personToTeam.hasOwnProperty(p.name)) {
        personToTeam[p.name] = null;
      }
    });

    return personToTeam;
  };

  handleRemovePerson = (personName) => {
    const personIndex = this.props.people.findIndex(p => p.name === personName);
    if (personIndex === -1) return;

    if (window.confirm(`Are you sure you want to remove salesperson "${personName}"?`)) {
      const { teams } = this.props;
      const personToTeam = this.getPersonToTeamMap();

      // Remove from people
      this.props.removePerson(personIndex);

      // Remove from their team (if any)
      if (personToTeam[personName] !== null) {
        const teamIndex = personToTeam[personName];
        const team = teams[teamIndex];
        const newMembers = team.members.filter(m => m !== personName);
        this.props.updateTeamMembers(teamIndex, newMembers);
      }
    }
  };

  getPersonToTeamMap = () => {
    const { teams, people } = this.props;
    const personToTeam = {};
    teams.forEach((team, i) => {
      (team.members || []).forEach((m) => (personToTeam[m] = i));
    });
    people.forEach((p) => {
      if (!personToTeam.hasOwnProperty(p.name)) personToTeam[p.name] = null;
    });
    return personToTeam;
  };

  handleAssignToTeam = (personName, teamId, currentTeamId) => {
    const { teams} = this.props;
    const teamIndex = teams.findIndex((t) => t.id === teamId);
    const currentTeamIndex = teams.findIndex((t) => t.id === currentTeamId);

    if (teamIndex === -1) return;
    for(const index in teams){
      if(teams[teamIndex].members.findIndex( member => member === teamId)){
      }
    }

    for(const i in teams){
      if(teams[i].id === currentTeamId){
        const memberIndex = teams[i].members.findIndex(person => person === personName);

        if(memberIndex > -1){
          this.handleRemoveFromTeam(personName, currentTeamId)
        };
      };
    };
    const newMembers = [...(teams[teamIndex].members || []), personName];

    this.props.updateTeamMembers(teamIndex, newMembers);
  };

  handleRemoveFromTeam = (personName, teamId) => {
    const { teams } = this.props;
    const teamIndex = teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) return;
    const newMembers = teams[teamIndex].members.filter((m) => m !== personName);
    this.props.updateTeamMembers(teamIndex, newMembers);
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

  startEditingTeam = (index, currentName, currentColor) => {
    this.setState({ editingTeamIndex: index, editingTeamName: currentName, editingTeamColor: currentColor });
  };

  cancelEditingTeam = () => {
    this.setState({ editingTeamIndex: null, editingTeamName: '', editingTeamColor: '#1976d2' });
  };

  saveEditingTeam = (currentTeam) => {
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

    const teamIndex = this.props.teams.findIndex(team => team.id === currentTeam.id);
    
    this.props.updateTeam(teamIndex, { name: editingTeamName.trim(), color: editingTeamColor, members: currentTeam.members, date: currentTeam.date, id: currentTeam.id });
    this.setState({ editingTeamIndex: null, editingTeamName: ''});
  };

  sortTeamNames = ()=>{
      const teams = this.props.teams;
      teams.sort((currentTeam, nextTeam)=> {
        if(currentTeam.name < nextTeam.name){
          return -1;
        }

        if(currentTeam.name > nextTeam.name){
          return 1;
        };

        return 0;
      });
  }

  sortPeopleinMembers = ()=>{
    const teams = this.props.teams;
      for(const teamIndex in teams){
        teams[teamIndex].members.sort()
      };
  }

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
    // inside render()
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter teams for current month
    const filteredTeams = teams
      .filter(team => {
        const teamDate = new Date(team.date);

        return teamDate.getMonth() === currentMonth && teamDate.getFullYear() === currentYear;
      }).sort((a, b) => {
        if(a.name > b.name){
          return 1;
        }

        if(a.name < b.name){
          return -1;
        }

        return 0;
      });

    // Map person -> team index (for current month)
    const personToTeamMap = {};
    filteredTeams.forEach((team, idx) => {
      (team.members || []).forEach(memberName => {
        personToTeamMap[memberName] = idx;
      });
    });
    people.forEach(p => {
      if (!personToTeamMap.hasOwnProperty(p.name)) {
        personToTeamMap[p.name] = null;
      }
    });

    // Unassigned people for this month
    const unassignedPeople = people.filter(p => personToTeamMap[p.name] === null);


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
      ...draggableStyle
    });

    const getListStyle = (isDraggingOver) => ({
      background: isDraggingOver ? '#bbdefb' : '#f5f5f5',
      padding: ".75em .25em !important",
      minHeight: 50,
      maxHeight: 400,
      borderRadius: 6,
      border: '1px solid #EB0A1E',
      display: 'grid',
      gridAutoRows: 'min-content',   // 👈 each row fits its content
      gridTemplateColumns: { 
        sm: 'repeat(2, 1fr)', 
        md: 'repeat(3, 1fr)' 
      },
      gap: '2px',                    // 👈 tight consistent spacing
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'thin',
      whiteSpace: 'normal',

      // 👇 mobile: single tight column
      '@media (max-width: 600px)': {
        display: 'flex',
        flexDirection: 'column',
      },
    });

    const getTeamListStyle = (isDraggingOver) => ({
      background: isDraggingOver ? '#bbdefb' : '#f5f5f5',
      padding: ".75em .25em !important",
      minHeight: 400,
      borderRadius: 3,
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

      for (const sale of salesData) {
        for (const [key, value] of Object.entries(sale)) {
          if (personName === key) {
            const date = new Date();
            const currentMonth = date.getMonth();
            const sellDate = new Date(sale.date);
            if (sellDate.getMonth() === currentMonth) {
              sellsCount += Number(sale[key]);
            }
          }
        }
      }
      return sellsCount;
    };

    const getUnassignedCarsSold = (person)=>{
      const personCarsSold = this.props.salesData;
      let salesCount = 0;

      for(const saleIndex in personCarsSold){
        const sale = personCarsSold[saleIndex];
        if(sale.hasOwnProperty(person.name)){
          salesCount = salesCount + sale[person.name];
        };
      };

      return salesCount;
    }

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
            '& > button': { minWidth: 120 },
            '@media (max-width: 620px)': {
              gap: 1,
              '& > button': { flexGrow: 1, minWidth: 100 },
            },
          }}
        >
          {!addingTeam ? (
            <Button variant="contained" onClick={this.startAddingTeam} sx={{ padding: '14px 24px', backgroundColor: '#EB0A1E' }}>
              Add New Team
            </Button>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); this.saveAddingTeam(); }} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
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
                  '& .MuiOutlinedInput-root': { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#EB0A1E' } },
                }}
              />
              <input
                type="color"
                value={addTeamColorInput}
                onChange={(e) => this.setState({ addTeamColorInput: e.target.value })}
                style={{ width: 32, height: 32, border: 'none', cursor: 'pointer', flexShrink: 0, borderRadius: 4 }}
              />
              <Button variant="contained" type="submit" sx={{ backgroundColor: '#EB0A1E', flexShrink: 0, minWidth: 75, whiteSpace: 'nowrap' }}>Save</Button>
              <Button variant="outlined" onClick={this.cancelAddingTeam} type="button" sx={{ flexShrink: 0, minWidth: 75, whiteSpace: 'nowrap' }}>Cancel</Button>
            </form>
          )}
        </Box>

        {/* Add Person section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 6, alignItems: 'center', flexWrap: 'wrap', '& > button': { minWidth: 120 }, '@media (max-width: 620px)': { gap: 1, '& > button': { flexGrow: 1, minWidth: 100 } } }}>
          {!addingPerson ? (
            <Button variant="contained" onClick={this.startAddingPerson} sx={{ padding: '14px 24px', backgroundColor: '#EB0A1E' }}>
              Add New Salesperson
            </Button>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); this.saveAddingPerson(); }} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
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
                  '& .MuiOutlinedInput-root': { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#EB0A1E' } },
                }}
              />
              <Button variant="contained" type="submit" sx={{ backgroundColor: '#EB0A1E', flexShrink: 0, minWidth: 75, whiteSpace: 'nowrap' }}>Save</Button>
              <Button variant="outlined" onClick={this.cancelAddingPerson} type="button" sx={{ flexShrink: 0, minWidth: 75, whiteSpace: 'nowrap' }}>Cancel</Button>
            </form>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, overflowX: 'hidden' }}>
          {/* Unassigned salespeople */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Unassigned Salespeople
            </Typography>
            <Box sx={{ ...getListStyle(false), minHeight: 100 }}>
              {unassignedPeople.length === 0 ? (
                <Typography sx={{ textAlign: 'center', margin: "auto" }}>No unassigned salespeople</Typography>
              ) : (
                unassignedPeople.map((person) => (
                  <Box
                    key={person.name}
                    sx={{
                      ...getItemStyle(false),
                      width: '100%',
                      minHeight: 40,
                      margin: '0 auto 6px auto',
                      padding: '8px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRadius: 1,
                      backgroundColor: '#f9f9f9',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'background-color 0.2s ease',
                      '&:hover': { backgroundColor: '#e3f2fd' },
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontWeight: 500, flex: 1, wordBreak: 'break-word' }}>
                      {person.name} ({getCarsSold(person.name)} cars sold)
                    </span>

                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      {/* Assign dropdown */}
                      <Select
                        size="small"
                        value="" // default empty
                        displayEmpty
                        onChange={(e) => this.handleAssignToTeam(person.name, e.target.value)}
                        sx={{ minWidth: 80 }}
                      >
                        <MenuItem value="" disabled>Assign</MenuItem>
                        {filteredTeams.map((team) => {
                          const inTeam = team.members.includes(person.name);

                          return (
                            <MenuItem key={team.id} value={team.id} disabled={inTeam}>
                              {team.name}{inTeam ? " (already in)" : ""}
                            </MenuItem>
                          );
                        })}
                      </Select>

                      {/* Remove person */}
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => this.handleRemovePerson(person.name)}
                        sx={{ minWidth: 28, padding: '2px 6px', border: "none"}}
                      >
                        ×
                      </Button>
                    </Box>
                  </Box>

                ))
              )}
            </Box>
          </Box>

          {/* Teams */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Teams</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(220px, 1fr))' }, gap: 2 }}>
              {filteredTeams.length === 0 && <Typography sx={{ gridColumn: '1 / -1', textAlign: 'center' }}>No teams added yet</Typography>}
              {filteredTeams.map((team, index) => (
                <Paper key={team.name} sx={{ ...getTeamListStyle(), borderColor: team.color, padding: '0.5em 0.75em' }}>
                  <Box sx={{mt: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: team.color, fontWeight: 'bold', fontSize: '1.1rem', flexWrap: 'wrap' }}>
                    {editingTeamIndex === index ? (
                      <>
                        <TextField value={editingTeamName} onChange={(e) => this.setState({ editingTeamName: e.target.value })} size="small" sx={{ flexGrow: 1, minWidth: '6rem' }} />
                        <input type="color" value={editingTeamColor} onChange={(e) => this.setState({ editingTeamColor: e.target.value })} style={{ width: 30, height: 30, border: 'none', cursor: 'pointer' }} />
                        <Button size="small" onClick={() => this.saveEditingTeam(team)} sx={{ color: team.color }}>Save</Button>
                        <Button size="small" onClick={this.cancelEditingTeam} sx={{ color: team.color }}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <span>{team.name}</span>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" sx={{ color: team.color }} onClick={() => this.startEditingTeam(index, team.name, team.color)}>Edit</Button>
                          <Button size="small" sx={{ color: team.color }} onClick={() => this.handleRemoveTeam(index)}>Delete</Button>
                        </Box>
                      </>
                    )}
                  </Box>

                  {team.members && team.members.length > 0 ? (
                    team.members.map((memberName) => {
                      const member = people.find((p) => p.name === memberName);
                      const carsSold = member ? getCarsSold(member.name) : 0;
                      return (
                        <Box
                          key={memberName}
                          sx={{
                            ...getItemStyle(false),
                            width: '100%',
                            minHeight: 40,
                            margin: '0 auto 6px auto',
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'space-evenly',
                            alignItems: 'center',
                            borderRadius: 1,
                            backgroundColor: '#f9f9f9',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            transition: 'background-color 0.2s ease',
                            '&:hover': { backgroundColor: '#e3f2fd' },
                            flexWrap: 'wrap',
                          }}
                        >
                          <span style={{ fontWeight: 500, flex: 1, wordBreak: 'break-word' }}>
                            {memberName} ({getCarsSold(memberName)} cars sold)
                          </span>

                          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                            {/* Assign dropdown */}
                            <Select
                              size="small"
                              value="" // default empty
                              displayEmpty
                              onChange={(e) => this.handleAssignToTeam(memberName, e.target.value,team.id)}
                              sx={{ minWidth: 80 }}
                            >
                              <MenuItem value="" disabled>Assign</MenuItem>
                              {filteredTeams.map((team) => {
                                const inTeam = team.members.includes(memberName);
                                return (
                                  <MenuItem key={team.id} value={team.id} disabled={inTeam}>
                                    {team.name}{inTeam ? " (already in)" : ""}
                                  </MenuItem>
                                );
                              })}
                            </Select>

                            {/* Unassign button */}
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => {
                                const currentTeam = teams.find((t) => t.members.includes(memberName));
                                if (currentTeam) this.handleRemoveFromTeam(memberName, currentTeam.id);
                              }}
                              sx={{ minWidth: 25, padding: '1px 6px' }}
                            >
                              Unassign
                            </Button>

                            {/* Remove person */}
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => this.handleRemovePerson(memberName)}
                              sx={{ minWidth: 28, padding: '2px 6px', border: "none" }}
                            >
                              ×
                            </Button>
                          </Box>
                        </Box>

                      );
                    })
                  ) : (
                    <Typography sx={{ color: '#888', fontStyle: 'italic', padding: '8px' }}>No members in this team</Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );

  }
}

export default ManageTeamsAndPeople;
