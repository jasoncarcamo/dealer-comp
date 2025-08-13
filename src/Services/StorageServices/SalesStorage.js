const SalesStorage = {
    getSales(){
        return localStorage.getItem('salesData');
    },
    setSale(people){
        return localStorage.setItem('salesData', JSON.stringify(people));
    }
};

export default SalesStorage;