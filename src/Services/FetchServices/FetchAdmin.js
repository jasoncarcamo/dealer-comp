import config from "../../config";
const url =  config.url

const FetchAdmin = {
    loginAdmin(admin){
        return fetch(`${url}/api/admin`, {
            method: "POST",
            headers: {
                'content-type': "application/json"
            },
            body: JSON.stringify(admin)
        })  
            .then( res => {
                if(!res){
                    return res.json().then( e => Promise.reject(e));
                }

                return res.json();
            })
    }
};

export default FetchAdmin;