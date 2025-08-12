import React, { Component } from 'react';
import NavBar from './NavBar/NavBar';
import TabsMenu from './TabsMenu/TabsMenu';
import ManageTeamsAndPeople from './ManageTeamsAndPeople/ManageTeamsAndPeople';
import EnterSales from './EnterSales/EnterSales';
import CompetitionAndCharts from './CompetitionAndCharts/CompetitionAndCharts';
import History from './History/History';
import { Container, Paper } from '@mui/material';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
      teams: JSON.parse(localStorage.getItem('teams')) || [],
      people: JSON.parse(localStorage.getItem('people')) || [],
      salesData: JSON.parse(localStorage.getItem('salesData')) || [],
    };
  }

  handleTabChange = (e, newValue) => {
    this.setState({ tabValue: newValue });
  };

  addTeam = (team) => {
    this.setState(
      (prev) => ({ teams: [...prev.teams, team] }),
      () => localStorage.setItem('teams', JSON.stringify(this.state.teams))
    );
  };

  removeTeam = (teamIndex) => {
    this.setState(
      (prev) => {
        const newTeams = [...prev.teams];
        newTeams.splice(teamIndex, 1);
        return { teams: newTeams };
      },
      () => localStorage.setItem('teams', JSON.stringify(this.state.teams))
    );
  };

  updateTeam = (index, updatedTeam) => {
    this.setState(
      (prev) => {
        const teams = [...prev.teams];
        teams[index] = { ...teams[index], ...updatedTeam };
        return { teams };
      },
      () => localStorage.setItem('teams', JSON.stringify(this.state.teams))
    );
  };

  updateTeamMembers = (teamIndex, members) => {
    this.setState(
      (prev) => {
        const teams = [...prev.teams];
        teams[teamIndex].members = members;
        return { teams };
      },
      () => localStorage.setItem('teams', JSON.stringify(this.state.teams))
    );
  };

  addPerson = (person) => {
    this.setState(
      (prev) => ({ people: [...prev.people, person] }),
      () => localStorage.setItem('people', JSON.stringify(this.state.people))
    );
  };

  removePerson = (personIndex) => {
    this.setState(
      (prev) => {
        const people = [...prev.people];
        const removedPerson = people.splice(personIndex, 1)[0];
        const teams = prev.teams.map((team) => ({
          ...team,
          members: team.members.filter((m) => m !== removedPerson.name),
        }));
        // Note: salesData untouched here to preserve sales history
        return { people, teams };
      },
      () => {
        localStorage.setItem('people', JSON.stringify(this.state.people));
        localStorage.setItem('teams', JSON.stringify(this.state.teams));
      }
    );
  };

  updateSalesData = (newSalesData) => {
    this.setState({ salesData: newSalesData }, () => {
      localStorage.setItem('salesData', JSON.stringify(this.state.salesData));
    });
  };

  updateTeamNameAndColor = (teamId, newName, newColor) => {
  this.setState((prev) => ({
    teams: prev.teams.map((t) =>
      t.id === teamId ? { ...t, name: newName, color: newColor } : t
    ),
  }));
};

  render() {
    
    return (
      <div>
        <NavBar />
        <TabsMenu value={this.state.tabValue} onChange={this.handleTabChange} />
        <Container sx={{ marginTop: 4, marginBottom: 4 }}>
          <Paper sx={{ padding: 3 }}>
            {this.state.tabValue === 0 && (
              <ManageTeamsAndPeople
                teams={this.state.teams}
                people={this.state.people}
                salesData={this.state.salesData}
                addTeam={this.addTeam}
                removeTeam={this.removeTeam}
                updateTeam={this.updateTeam}
                addPerson={this.addPerson}
                removePerson={this.removePerson}
                updateTeamMembers={this.updateTeamMembers}
                updateTeamNameAndColor={this.updateTeamNameAndColor}
              />
            )}
            {this.state.tabValue === 1 && (
              <EnterSales
                people={this.state.people}
                salesData={this.state.salesData}
                updateSalesData={this.updateSalesData}
              />
            )}
            {this.state.tabValue === 2 && (
              <CompetitionAndCharts
                salesData={this.state.salesData}
                teams={this.state.teams}
              />
            )}
            {this.state.tabValue === 3 && (
              <History salesData={this.state.salesData} teams={this.state.teams} people={this.state.people}/>
            )}
          </Paper>
        </Container>
      </div>
    );
  }
}

export default App;
