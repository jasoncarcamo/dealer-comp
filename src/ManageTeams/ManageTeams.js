import React, { Component } from 'react';
import {
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import './ManageTeamsAndPeople.css';

class ManageTeamsAndPeople extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newTeamName: '',
      newTeamColor: '#1976d2',
      newPersonName: '',
      selectedTeamIndex: null,
      editingTeamIndex: null,
      editingTeamName: '',
      editingTeamColor: '#1976d2',
    };
  }

  handleAddTeam = () => {
    const { newTeamName, newTeamColor } = this.state;
    if (!newTeamName.trim()) return;
    const exists = this.props.teams.some(
      (team) => team.name.toLowerCase() === newTeamName.trim().toLowerCase()
    );
    if (exists) {
      alert('Team name already exists.');
      return;
    }
    this.props.addTeam({ name: newTeamName.trim(), color: newTeamColor, members: [] });
    this.setState({ newTeamName: '' });
  };

  handleDeleteTeam = (index) => {
    if (window.confirm('Delete this team?')) {
      this.props.deleteTeam(index);
      if (this.state.selectedTeamIndex === index) {
        this.setState({ selectedTeamIndex: null });
      }
    }
  };

  startEditingTeam = (index) => {
    const team = this.props.teams[index];
    this.setState({
      editingTeamIndex: index,
      editingTeamName: team.name,
      editingTeamColor: team.color,
    });
  };

  cancelEditing = () => {
    this.setState({ editingTeamIndex: null, editingTeamName: '', editingTeamColor: '#1976d2' });
  };

  saveTeamEdit = () => {
    const { editingTeamIndex, editingTeamName, editingTeamColor } = this.state;
    if (!editingTeamName.trim()) return alert('Team name cannot be empty');
    const exists = this.props.teams.some(
      (team, i) => i !== editingTeamIndex && team.name.toLowerCase() === editingTeamName.trim().toLowerCase()
    );
    if (exists) {
      alert('Another team with that name already exists.');
      return;
    }
    this.props.updateTeam(editingTeamIndex, { name: editingTeamName.trim(), color: editingTeamColor });
    this.setState({ editingTeamIndex: null, editingTeamName: '', editingTeamColor: '#1976d2' });
  };

  handleAddPerson = () => {
    const { newPersonName } = this.state;
    if (!newPersonName.trim()) return;
    const exists = this.props.people.some(
      (p) => p.name.toLowerCase() === newPersonName.trim().toLowerCase()
    );
    if (exists) {
      alert('Person already exists.');
      return;
    }
    this.props.addPerson({ name: newPersonName.trim() });
    this.setState({ newPersonName: '' });
  };

  handleRemovePerson = (personName) => {
    if (window.confirm(`Are you sure you want to remove salesperson "${personName}"?`)) {
        this.props.removePerson(personName);
    }
    };

  togglePersonInTeam = (personIndex) => {
    const { selectedTeamIndex } = this.state;
    if (selectedTeamIndex === null) return;
    const team = this.props.teams[selectedTeamIndex];
    const personName = this.props.people[personIndex].name;
    const members = [...team.members];
    const memberIndex = members.indexOf(personName);
    if (memberIndex > -1) {
      members.splice(memberIndex, 1);
    } else {
      members.push(personName);
    }
    this.props.updateTeamMembers(selectedTeamIndex, members);
  };

  render() {
    const { teams, people } = this.props;
    const {
      newTeamName,
      newTeamColor,
      newPersonName,
      selectedTeamIndex,
      editingTeamIndex,
      editingTeamName,
      editingTeamColor,
    } = this.state;
    const selectedTeam = selectedTeamIndex !== null ? teams[selectedTeamIndex] : null;

    return (
      <div className="manage-container">
        <Box className="section" sx={{ marginBottom: 3 }}>
          <Typography variant="h5" gutterBottom>
            Teams
          </Typography>
          <Box sx={{ display: 'flex', gap: '1rem', marginBottom: 1, alignItems: 'center' }}>
            <TextField
              label="New Team Name"
              value={newTeamName}
              onChange={(e) => this.setState({ newTeamName: e.target.value })}
              size="small"
            />
            <input
              type="color"
              value={newTeamColor}
              onChange={(e) => this.setState({ newTeamColor: e.target.value })}
              style={{ width: '40px', height: '32px', border: 'none', cursor: 'pointer' }}
            />
            <Button variant="contained" onClick={this.handleAddTeam}>
              Add Team
            </Button>
          </Box>
          <Paper variant="outlined" className="list-paper">
            <List>
              {teams.map((team, i) => (
                <ListItem
                  button
                  selected={i === selectedTeamIndex}
                  key={i}
                  onClick={() => this.setState({ selectedTeamIndex: i })}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: team.color,
                      borderRadius: '3px',
                      marginRight: '1rem',
                    }}
                  />
                  {editingTeamIndex === i ? (
                    <>
                      <TextField
                        size="small"
                        value={editingTeamName}
                        onChange={(e) => this.setState({ editingTeamName: e.target.value })}
                        sx={{ marginRight: 1 }}
                      />
                      <input
                        type="color"
                        value={editingTeamColor}
                        onChange={(e) => this.setState({ editingTeamColor: e.target.value })}
                        style={{ width: '40px', height: '32px', border: 'none', cursor: 'pointer', marginRight: 8 }}
                      />
                      <IconButton onClick={this.saveTeamEdit} aria-label="save">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={this.cancelEditing} aria-label="cancel">
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <ListItemText primary={team.name} />
                      <IconButton onClick={(e) => { e.stopPropagation(); this.startEditingTeam(i); }} aria-label="edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          this.handleDeleteTeam(i);
                        }}
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        <Box className="section" sx={{ marginBottom: 3 }}>
          <Typography variant="h5" gutterBottom>
            Salespeople
          </Typography>
          <Box sx={{ display: 'flex', gap: '1rem', marginBottom: 1, alignItems: 'center' }}>
            <TextField
              label="New Person Name"
              value={newPersonName}
              onChange={(e) => this.setState({ newPersonName: e.target.value })}
              size="small"
            />
            <Button variant="contained" onClick={this.handleAddPerson}>
              Add Person
            </Button>
          </Box>
          <Paper variant="outlined" className="list-paper">
            <List>
              {people.map((person, i) => (
                <ListItem
                  key={i}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => this.handleDeletePerson(i)} aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={person.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        <Box className="section">
          <Typography variant="h5" gutterBottom>
            Assign People to Team
          </Typography>
          {!selectedTeam && <Typography>Select a team to assign members</Typography>}
          {selectedTeam && (
            <Paper variant="outlined" className="list-paper">
              <List>
                {people.map((person, i) => (
                  <ListItem key={i} button onClick={() => this.togglePersonInTeam(i)}>
                    <Checkbox checked={selectedTeam.members.includes(person.name)} />
                    <ListItemText primary={person.name} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </div>
    );
  }
}

export default ManageTeamsAndPeople;