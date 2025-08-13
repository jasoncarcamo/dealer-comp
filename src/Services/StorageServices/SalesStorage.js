const SalesStorage = {
    getSales(){
        return localStorage.getItem('salesData');
    },
    setSale(sale){
        return localStorage.setItem('salesData', JSON.stringify(sale));
    }
};

export default SalesStorage;