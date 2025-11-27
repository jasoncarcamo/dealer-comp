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
        });


        return localStorage.setItem("bonuses", JSON.stringify(sortedBonuses));
    },
    saveBonuses(bonuses){
        return localStorage.setItem("bonuses", JSON.stringify(bonuses));
    },
    findBonusById(bonus){
        const bonuses = JSON.parse(this.getBonuses());
        const bonusesByYearandMonth = bonuses[new Date(bonus.start_date).getFullYear()][new Date(bonus.start_date).getMonth()];
        const bonusIndex = bonusesByYearandMonth.findIndex(b => b.id = bonus.id);

  

    },
    addBonus(bonus){
        const bonuses = JSON.parse(this.getBonuses());
        const bonusesByYearandMonth = bonuses[new Date(bonus.start_date).getFullYear()][new Date(bonus.start_date).getMonth()];
        
        bonusesByYearandMonth.push(bonus)
        
        return bonuses
    },
    editBonus(editedBonus){
        const bonuses = JSON.parse(this.getBonuses());
        const bonusesByYearandMonth = bonuses[new Date(editedBonus.start_date).getFullYear()][new Date(editedBonus.start_date).getMonth()];
        const bonusIndex = bonusesByYearandMonth.findIndex(b => b.id = editedBonus.id);

        bonusesByYearandMonth[bonusIndex] = editedBonus;
        this.saveBonuses(bonuses);
    },
    deleteBonus(bonus){
        const bonuses = JSON.parse(this.getBonuses());
        let bonusesByYearandMonth = bonuses[new Date(bonus.start_date).getFullYear()][new Date(bonus.start_date).getMonth()];
        const bonusIndex = bonusesByYearandMonth.findIndex(b => b.id = bonus.id);
        
        bonusesByYearandMonth.splice(bonusIndex, 1);

        this.saveBonuses(bonuses);
    }
};

export default BonusesStorage;