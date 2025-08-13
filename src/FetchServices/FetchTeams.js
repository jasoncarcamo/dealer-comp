const url =  "http://localhost:8000"

const FetchTeams = {
    getAllTeams(){
        return fetch(`${url}/api/teams`, {
            method: "GET",
            headers: {
                'content-type': "application/json"
            }
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    },
    getTeamById(id){
        return fetch(`${url}/api/teams/${id}`, {
            method: "GET",
            headers: {
                'content-type': "application/json",
                'authorization': `bearer `
            }
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    },
    createTeam(token, newTeam){
        return fetch(`${url}/api/teams`, {
            method: "POST",
            headers: {
                'content-type': "application/json",
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify(newTeam)
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    },
    updateTeamById(token, updatedTeam, id){
        return fetch(`${url}/api/teams/${id}`, {
            method: "POST",
            headers: {
                'content-type': "application/json",
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify(updatedTeam)
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    },
    deleteTeam(token, id){
        return fetch(`${url}/api/teams/${id}`, {
            method: "POST",
            headers: {
                'content-type': "application/json",
                'authorization': `bearer ${token}`
            }
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    }
};

export default FetchTeams;