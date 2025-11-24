const config = {
    url: !process.env.NODE_ENV ? "https://dealer-comp-api-24cd738121b2.herokuapp.com" : "http://localhost:8000"
};


console.log(process.env.NODE_ENV)
export default config;