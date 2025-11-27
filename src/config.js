const config = {
    url: process.env.NODE_ENV !== "development" ? "https://dealer-comp-api-24cd738121b2.herokuapp.com" : "http://localhost:8000"
};

console.log(config.url, process.env.NODE_ENV)

export default config;