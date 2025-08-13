const PeopleStorage = {
    People(){
        return localStorage.getItem('people');
    },
    setPeople(people){
        return localStorage.setItem('people', JSON.stringify(people));
    }
};

export default PeopleStorage;