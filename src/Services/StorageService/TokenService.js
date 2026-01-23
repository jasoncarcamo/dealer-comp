const TokenService = {
    getToken(){
        return localStorage.getItem("admin-token");
    },
    setToken(token){
        return localStorage.setItem("admin-token", token);
    },
    updateToken(token){
        return this.setToken(token);
    },
    removeToken(){
        return localStorage.removeItem("admin-token");
    }
}

export default TokenService;