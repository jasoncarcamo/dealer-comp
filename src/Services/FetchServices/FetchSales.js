const url =  "http://localhost:8000"

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
    getSaleById(id){
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
    createSale(newSale){
        return fetch(`${url}/api/sales`, {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify(newSale)
        })
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                };

                return res.json();
            });
    },
    updateSaleById(updatedSalesPerson, id){
        return fetch(`${url}/api/sales/${id}`, {
            method: "POST",
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
    deleteSaleById(id){
        return fetch(`${url}/api/sales/${id}`, {
            method: "POST",
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

export default FetchSales;