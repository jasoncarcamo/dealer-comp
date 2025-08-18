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
import FetchSalesPeople from './Services/FetchServices/FetchSalesPeople';
import FetchTeams from './Services/FetchServices/FetchTeams';

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
        const teams = data.teams;

        TeamStorage.setTeams([ { id: 11, name: "Team 400", color: "#1976d2", members: ["Jay", "Justin", "Luis", "Justin A"], date: "2025-07-18T03:40:09.903Z" }, { id: 9, name: "Team 200", color: "#1976d2", members: ["Greg", "Will", "Jasmine", "Liz"], date: "2025-07-18T03:40:04.075Z" }, { id: 10, name: "Team 300", color: "#1976d2", members: ["Brandon", "Nelson", "Jacob", "Jason"], date: "2025-07-18T03:40:07.168Z" }, { id: 4, name: "Team Acorn", color: "#1976d2", members: ["Lynn", "Raphael", "Darien", "Sandra"], date: "2025-07-18T03:40:01.255Z" }, {
    id: 11,
    name: "Team 4",
    color: "#1976d2",
    members: ["Jay","Justin","Luis","Justin A"],
    date: "2025-08-18T03:40:09.903Z"
  },
  {
    id: 9,
    name: "Team 2",
    color: "#1976d2",
    members: ["Greg","Will","Jasmine","Liz"],
    date: "2025-08-18T03:40:04.075Z"
  },
  {
    id: 10,
    name: "Team 3",
    color: "#1976d2",
    members: ["Brandon","Nelson","Jacob","Jason"],
    date: "2025-08-18T03:40:07.168Z"
  },
  {
    id: 8,
    name: "Team 1",
    color: "#1976d2",
    members: ["Lynn","Raphael","Darien","Sandra"],
    date: "2025-08-18T03:40:01.255Z"
  }]);
        PeopleStorage.setPeople(data.people)

        SalesStorage.setSale([
  {
    date: "2025-06-01",
    Jay: 2, Sandra: 1, Darien: 3, Raphael: 1, Greg: 0, Will: 2, Jasmine: 1, Liz: 3,
    Jason: 0, Brandon: 2, Nelson: 1, Jacob: 3, Luis: 0, Justin: 2, "Justin A": 1, Lynn: 0,
    Alice: 3, Bob: 2, Charlie: 1, Diana: 2, Ethan: 1, Fiona: 3, George: 0,
    Hannah: 2, Ian: 1, Jack: 3, Karen: 0, Leo: 2, Mia: 1, Nathan: 3
  },
  {
    date: "2025-06-08",
    Jay: 1, Sandra: 2, Darien: 0, Raphael: 2, Greg: 1, Will: 0, Jasmine: 3, Liz: 1,
    Jason: 2, Brandon: 1, Nelson: 3, Jacob: 0, Luis: 1, Justin: 3, "Justin A": 2, Lynn: 1,
    Alice: 2, Bob: 3, Charlie: 1, Diana: 0, Ethan: 2, Fiona: 1, George: 3,
    Hannah: 1, Ian: 2, Jack: 0, Karen: 3, Leo: 1, Mia: 2, Nathan: 0
  },
  {
    date: "2025-06-15",
    Jay: 0, Sandra: 1, Darien: 2, Raphael: 3, Greg: 2, Will: 1, Jasmine: 0, Liz: 2,
    Jason: 1, Brandon: 3, Nelson: 0, Jacob: 1, Luis: 2, Justin: 1, "Justin A": 3, Lynn: 0,
    Alice: 1, Bob: 2, Charlie: 3, Diana: 1, Ethan: 3, Fiona: 2, George: 1,
    Hannah: 0, Ian: 3, Jack: 2, Karen: 1, Leo: 0, Mia: 2, Nathan: 3
  },
  {
    date: "2025-06-22",
    Jay: 2, Sandra: 0, Darien: 1, Raphael: 2, Greg: 1, Will: 2, Jasmine: 1, Liz: 0,
    Jason: 3, Brandon: 2, Nelson: 1, Jacob: 2, Luis: 3, Justin: 0, "Justin A": 1, Lynn: 2,
    Alice: 3, Bob: 1, Charlie: 0, Diana: 2, Ethan: 1, Fiona: 3, George: 2,
    Hannah: 1, Ian: 0, Jack: 2, Karen: 3, Leo: 1, Mia: 2, Nathan: 0
  },
  {
    date: "2025-07-01",
    Jay: 1, Sandra: 3, Darien: 0, Raphael: 2, Greg: 1, Will: 2, Jasmine: 0, Liz: 1,
    Jason: 3, Brandon: 2, Nelson: 1, Jacob: 0, Luis: 2, Justin: 1, "Justin A": 3, Lynn: 2,
    Alice: 0, Bob: 1, Charlie: 2, Diana: 3, Ethan: 1, Fiona: 2, George: 0,
    Hannah: 1, Ian: 3, Jack: 2, Karen: 1, Leo: 2, Mia: 0, Nathan: 3
  },
  {
    date: "2025-07-08",
    Jay: 2, Sandra: 0, Darien: 1, Raphael: 3, Greg: 0, Will: 1, Jasmine: 2, Liz: 0,
    Jason: 1, Brandon: 3, Nelson: 2, Jacob: 1, Luis: 0, Justin: 3, "Justin A": 2, Lynn: 1,
    Alice: 3, Bob: 0, Charlie: 1, Diana: 2, Ethan: 0, Fiona: 3, George: 1,
    Hannah: 2, Ian: 0, Jack: 3, Karen: 1, Leo: 2, Mia: 1, Nathan: 0
  },
  {
    date: "2025-07-15",
    Jay: 0, Sandra: 1, Darien: 2, Raphael: 1, Greg: 3, Will: 0, Jasmine: 2, Liz: 1,
    Jason: 2, Brandon: 1, Nelson: 0, Jacob: 3, Luis: 1, Justin: 2, "Justin A": 0, Lynn: 1,
    Alice: 2, Bob: 1, Charlie: 3, Diana: 0, Ethan: 2, Fiona: 1, George: 3,
    Hannah: 1, Ian: 2, Jack: 0, Karen: 3, Leo: 0, Mia: 2, Nathan: 1
  }
])

        this.setState({
          teams: JSON.parse(TeamStorage.getTeams()),
          people: JSON.parse(PeopleStorage.getPeople())
        });
      });
  }


  handleTabChange = (newValue) => {
    this.setState({ tabValue: newValue });
  };

  addTeam = (team) => {
    FetchTeams.createTeam(team)
      .then( createdTeam => {
        this.setState(
          (prev) => ({ teams: [...prev.teams, createdTeam] }),
          () => TeamStorage.setTeams(this.state.teams)
        );
      })
      .catch( err => console.log(err))
  };

  removeTeam = (teamIndex) => {
  const teamToRemove = this.state.teams[teamIndex];

  FetchTeams.deleteTeamById(teamToRemove.id)
    .then((deletedTeam) => {
      this.setState(
        (prev) => ({
          teams: prev.teams.filter((t) => {
            return t.id !== deletedTeam.id
          })
        }),
        () => TeamStorage.setTeams(this.state.teams)
      );
    })
    .catch((err) => {
      console.error("Failed to delete team:", err);
    });
};


  updateTeam = (index, updatedTeam) => {
    const teams = [...this.state.teams];

    const editedTeam = { ...teams[index], ...updatedTeam };

    FetchTeams.updateTeamById(editedTeam, editedTeam.id)
      .then( patchedTeam => {

        teams[index] = editedTeam;
        
        this.setState(
          (prev) => {
            return { teams };
          },
          () => TeamStorage.setTeams(this.state.teams)
        );
      })
      .catch(err => console.log(err))
  };

  updateTeamMembers = (teamIndex, members) => {
    const teams = [...this.state.teams];
    const editedTeam = teams[teamIndex];

    editedTeam.members = members;

    this.updateTeam(teamIndex, editedTeam);
  };

  addPerson = (person) => {
    const newPerson = {
      name: person.name,
      cars_sold: person.carsSold,
      date: person.date
    }; 

    FetchSalesPeople.createSalesPerson("", newPerson)
      .then( createdPerson => {

        this.setState(
          (prev) => ({ people: [...prev.people, createdPerson] }),
          () => PeopleStorage.setPeople(this.state.people)
        );
      })
      .catch( err => {
        console.Consolelog(err)
      })
  };

  removePerson = (personIndex) => {
    const person = this.state.people[personIndex];

    FetchSalesPeople.deleteSalesPersonById("", person.id)
      .then( deletedPerson => {

        this.setState(
          (prev) => {
            const people = [...prev.people];
            const removedPerson = people.splice(personIndex, 1)[0];
            const teams = prev.teams.map((team) => ({
              ...team,
              members: team.members.filter((m) => m !== removedPerson.name === deletedPerson.name),
            }));
            return { people, teams };
          },
          () => {
            PeopleStorage.setPeople(this.state.people);
            TeamStorage.setTeams(this.state.teams);
          }
        );
      })
      .catch( err => console.log(err))
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
