const TeamStorage = {
    getTeams(){
        return localStorage.getItem("teams");
    },
    setTeams(team){
        return localStorage.setItem('teams', JSON.stringify(team));
    }
};

export default TeamStorage;