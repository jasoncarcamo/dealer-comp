const BonusesStorage = {
    getBonuses(){
        return localStorage.getItem("bonuses");
    },
    setBonuses(bonuses){
        const sortedBonuses = {};

        bonuses.map( bonus => {
            let year = new Date(bonus.start_date).getFullYear();
            let month = new Date(bonus.start_date).getMonth();

            if(typeof sortedBonuses[year] !== "object"){
                sortedBonuses[year] = {};
            };

            if(Array.isArray(sortedBonuses[year][month]) === false){
                sortedBonuses[year][month] = [];
            };

            sortedBonuses[year][month].push(bonus);   
            
        })

        console.log(sortedBonuses)

        return localStorage.setItem("bonuses", JSON.stringify(bonuses));
    }
};

export default BonusesStorage;