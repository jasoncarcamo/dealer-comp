import React, { Component } from 'react';
import NavBar from './Components/NavBar/NavBar';
import TabsMenu from './Components/TabsMenu/TabsMenu';
import ManageTeamsAndPeople from './Components/ManageTeamsAndPeople/ManageTeamsAndPeople';
import EnterSales from './Components/EnterSales/EnterSales';
import CompetitionAndCharts from './Components/CompetitionAndCharts/CompetitionAndCharts';
import History from './Components/History/History';
import { Container, Paper } from '@mui/material';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import FetchData from './Services/FetchServices/FetchData';
import PeopleStorage from './Services/StorageService/PeopleStorage';
import SalesStorage from './Services/StorageService/SalesStorage';
import TeamStorage from './Services/StorageService/TeamStorage';

// Helper component to bridge hooks with class component
function TabsRouterWrapper({ onTabChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Map path to tab index
  const pathToIndex = {
    '/manage-teams': 0,
    '/enter-sales': 1,
    '/competition': 2,
    '/history': 3,
  };

  // Map tab index to path
  const indexToPath = {
    0: '/manage-teams',
    1: '/enter-sales',
    2: '/competition',
    3: '/history',
  };

  // When URL changes, notify parent to update tabValue state
  React.useEffect(() => {
    const tabIndex = pathToIndex[location.pathname] ?? 0;
    onTabChange(tabIndex);
  }, [location.pathname, onTabChange]);

  // Handler to change route when tab changes
  const handleTabChange = (e, newValue) => {
    const newPath = indexToPath[newValue] || '/manage-teams';
    navigate(newPath);
  };

  return <TabsMenu value={pathToIndex[location.pathname] ?? 0} onChange={handleTabChange} />;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0, // controlled via URL now
      teams: JSON.parse(TeamStorage.getTeams()) || [],
      people: JSON.parse(PeopleStorage.getPeople()) || [],
      salesData: JSON.parse(SalesStorage.getSales()) || [],
    };
  }

  componentDidMount(){
    FetchData.getData()
      .then( data => {
        console.log(data)
      });
  }

  handleTabChange = (newValue) => {
    this.setState({ tabValue: newValue });
  };

  addTeam = (team) => {
    this.setState(
      (prev) => ({ teams: [...prev.teams, team] }),
      () => TeamStorage.setTeam(this.state.teams)
    );
  };

  removeTeam = (teamIndex) => {
    this.setState(
      (prev) => {
        const newTeams = [...prev.teams];
        newTeams.splice(teamIndex, 1);
        return { teams: newTeams };
      },
      () => TeamStorage.setTeam(this.state.teams)
    );
  };

  updateTeam = (index, updatedTeam) => {
    this.setState(
      (prev) => {
        const teams = [...prev.teams];
        teams[index] = { ...teams[index], ...updatedTeam };
        return { teams };
      },
      () => TeamStorage.setTeam(this.state.teams)
    );
  };

  updateTeamMembers = (teamIndex, members) => {
    this.setState(
      (prev) => {
        const teams = [...prev.teams];
        teams[teamIndex].members = members;
        return { teams };
      },
      () => TeamStorage.setTeam(this.state.teams)
    );
  };

  addPerson = (person) => {
    this.setState(
      (prev) => ({ people: [...prev.people, person] }),
      () => PeopleStorage.setPeople(this.state.people)
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
        return { people, teams };
      },
      () => {
        PeopleStorage.setPeople(this.state.people);
        TeamStorage.setTeam(this.state.teams);
      }
    );
  };

  updateSalesData = (newSalesData) => {
    this.setState({ salesData: newSalesData }, () => {
      SalesStorage.setSale(this.state.salesData);
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
    console.log(this.state);
    return (
      <Router>
        <div>
          <NavBar />
          <TabsRouterWrapper onTabChange={this.handleTabChange} />
          <Container sx={{ marginTop: 4, marginBottom: 4 }}>
            <Paper sx={{ padding: 3 }}>
              <Routes>
                <Route
                  path="/manage-teams"
                  element={
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
                  }
                />
                <Route
                  path="/enter-sales"
                  element={
                    <EnterSales
                      people={this.state.people}
                      salesData={this.state.salesData}
                      updateSalesData={this.updateSalesData}
                    />
                  }
                />
                <Route
                  path="/competition"
                  element={
                    <CompetitionAndCharts
                      salesData={this.state.salesData}
                      teams={this.state.teams}
                    />
                  }
                />
                <Route
                  path="/history"
                  element={
                    <History
                      salesData={this.state.salesData}
                      teams={this.state.teams}
                      people={this.state.people}
                    />
                  }
                />
                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/manage-teams" replace />} />
              </Routes>
            </Paper>
          </Container>
        </div>
      </Router>
    );
  }
}

export default App;
