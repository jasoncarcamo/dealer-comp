import React, { Component } from 'react';
import NavBar from './Components/NavBar/NavBar';
import TabsMenu from './Components/TabsMenu/TabsMenu';
import ManageTeamsAndPeople from './Components/ManageTeamsAndPeople/ManageTeamsAndPeople';
import EnterSales from './Components/EnterSales/EnterSales';
import CompetitionAndCharts from './Components/CompetitionAndCharts/CompetitionAndCharts';
import History from './Components/History/History';
import FullScreenLoader from './Components/FullScreenLoader/FullScreenloader';
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
import FetchSales from './Services/FetchServices/FetchSales';

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
      loadingData: true
    };
  }

  componentDidMount(){
    FetchData.getData()
      .then( data => {
        const teams = data.teams;
        
        TeamStorage.setTeams(teams);
        PeopleStorage.setPeople(data.people)
        SalesStorage.setSale(this.handleSalesData(data.salesData));

        this.setState({
          teams: JSON.parse(TeamStorage.getTeams()),
          people: JSON.parse(PeopleStorage.getPeople()),
          salesData: JSON.parse(SalesStorage.getSales()),
          loadingData: false
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

  handleSalesData = (salesData)=>{
    const newSalesData = [];

    for(const salesIndex in salesData){
      const newSale = {};
      const currentSale = salesData[salesIndex]

      newSale.id = currentSale.id
      newSale.date = currentSale.date;
      
      for(const personIndex in currentSale.sales){
        for(const [personKey, personValue] of Object.entries(currentSale.sales[personIndex])){
          newSale[personKey] = personValue;
        };
      };

      newSalesData.push(newSale);
    };

    return newSalesData
  };

  updateSalesData = (newSalesData, sale) => {
    const newSale = {
      date: sale.date,
      sales: []
    };
    
    for(const [key, value] of Object.entries(sale)){
      if(key !== "date"){
        if(key !== "id"){
          newSale.sales.push({[key]: value});
        }
      };
    };
    
    if(!sale.id){
      FetchSales.createSale(newSale)
        .then( createdSale => {
          newSalesData.forEach((newSale, i) => {
            if(new Date(newSale.date).getMonth() === new Date(createdSale.createdSale.date).getMonth() && newSale.id == sale.id){  
              sale.id = createdSale.createdSale.id;
              newSale = sale;
            }
          });
          this.setState({ salesData: newSalesData }, () => {
            SalesStorage.setSale(this.state.salesData);
          });
        })
        .catch( err => {
          console.log(err);
        });
    } else{
      FetchSales.updateSaleById(newSale, sale.id)
        .then( updatedSale => {
          newSalesData.forEach((newSale, i) => {
            if( newSale.id === Number(updatedSale.id)){
              newSalesData[i] = sale;
            };
          });
          this.setState({ salesData: newSalesData }, () => {
            SalesStorage.setSale(this.state.salesData);
          });
        })
        .catch( err => console.log(err));
    };
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
          {this.state.loadingData ? <FullScreenLoader/> : ""}
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
