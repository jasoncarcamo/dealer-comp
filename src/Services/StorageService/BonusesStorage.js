const BonusesStorage = {
    getBonuses(){
        return localStorage.getItem("bonuses");
    },
    setBonuses(bonuses){
        return localStorage.setItem("bonuses", JSON.stringify(bonuses));
    }
};

export default BonusesStorage;