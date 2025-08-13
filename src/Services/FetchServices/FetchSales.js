const url =  "https://localhost:8000"

const FetchSales = {
    getAllSales(){
        return fetch(`${url}/api/sales`, {
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
    getSalesById(id){
        return fetch(`${url}/api/sales/${id}`, {
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
        return fetch(`${url}/api/sales`, {
            method: "POST",
            headers: {
                'content-type': "application/json",
                'authorization': `bearer ${token}`
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
    updateSalesPersonById(token, updatedSalesPerson, id){
        return fetch(`${url}/api/sales/${id}`, {
            method: "POST",
            headers: {
                'content-type': "application/json",
                'authorization': `bearer ${token}`
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
    deleteSalesPerson(token, id){
        return fetch(`${url}/api/sales/${id}`, {
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

export default FetchSales;