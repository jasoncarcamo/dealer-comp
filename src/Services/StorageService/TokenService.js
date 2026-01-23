const TokenService = {
    getToken(){
        return localStorage.getItem("admin-token");
    },
    setToken(token){
        return localStorage.setItem("admin-token", token);
    }   
}

export default TokenService;