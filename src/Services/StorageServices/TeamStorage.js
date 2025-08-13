const TeamStorage = {
    getTeams(){
        return localStorage.getItem('teams');
    },
    setTeam(team){
        return localStorage.setItem('teams', JSON.stringify(team));
    }
};

export default TeamStorage;