import config from "../../config";
const url =  config.url


const FetchBonuses = {
    getAllBonuses(){
        return fetch(`${url}/api/bonuses`, {
            method: "GET",
            headers: {
                'content-type': "application/json"
            }
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };
            });
    },
    getBonusById(id){
        return fetch(`${url}/api/bonuses/${id}`, {
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
    createBonus(newBonus){
        return fetch(`${url}/api/bonuses`, {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify(newBonus)
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    },
    patchBonusById(patchBonus, id){
        return fetch(`${url}/api/bonuses/${id}`, {
            method: "patch",
            headers: {
                'content-type': "application/json",
                body: JSON.stringify(patchBonus)
            }
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    },
    deleteBonusById(id){
        return fetch(`${url}/api/bonuses/${id}`, {
            method: "delete",
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
    }
};

export default FetchBonuses;