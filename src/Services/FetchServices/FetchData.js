const url =  "http://localhost:8000"

const FetchData = {
    getData(){
        return fetch(`${url}/api/load`, {
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
    }
};

export default FetchData;