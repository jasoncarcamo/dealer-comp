import config from "../../config";
const url =  config.url

const FetchSalesPeople = {
    getAllSalesPeople(){
        return fetch(`${url}/api/salespeople`, {
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
    getSalesPersonById(id){
        return fetch(`${url}/api/salespeople/${id}`, {
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
    createSalesPerson(token, newSalesPerson){
        return fetch(`${url}/api/salespeople`, {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify(newSalesPerson)
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    },
    updateSalesPersonById(updatedSalesPerson, id){
        return fetch(`${url}/api/salespeople/${id}`, {
            method: "PATCH",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify(updatedSalesPerson)
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    },
    deleteSalesPersonById(token, id){
        return fetch(`${url}/api/salespeople/${id}`, {
            method: "DELETE",
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

export default FetchSalesPeople;