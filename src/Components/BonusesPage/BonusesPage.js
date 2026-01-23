import React, { Component } from "react";
import BonusesList from "./BonusesList/BonusesList";
import BonusForm from "./BonusesForm/BonusesForm";
import "./BonusesPage.css";
import FetchBonuses from "../../Services/FetchServices/FetchBonuses";
import ConfirmationMessage from "../ConfrimationMessage/ConfirmationMessage";
import BonusesStorage from "../../Services/StorageService/BonusesStorage";
import TokenService from "../../Services/StorageService/TokenService";

export default class BonusesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
        bonuses: JSON.parse(BonusesStorage.getBonuses()) || [],
        editingBonus: null,
        open: false,
        confirmationVisible: false,
        confirmationMessage: "",
        action: null,
        showForm: false,
        expandList: false,
        newlyAddedId: null
    };
}


componentDidMount(){
}

toggleForm = () => {
    this.setState((prev) => ({ showForm: !prev.showForm }));
  };

onCloseConfirmation = () => {
    this.setState({ confirmationVisible: false, confirmationMessage: "" });
};

expandLists = ()=>{
    this.setState({
        expandList: true
    })
}

toggleExpandList = ()=>{
    this.setState({
        expandList: !this.state.expandList
    })
}

addBonus = (bonus) => {
    FetchBonuses.createBonus(bonus)
        .then(saved => {
            BonusesStorage.saveBonuses(BonusesStorage.addBonus(saved.createdBonus))
            this.setState(
                prev => ({
                  bonuses: JSON.parse(BonusesStorage.getBonuses()),
                  confirmationVisible: true,
                  confirmationMessage: "Bonus added successfully!",
                  expandList: true,
                  newlyAddedId: saved.createdBonus.id
                })
              );
        })
        .catch(err => console.error("Error adding bonus", err));
};

removeBonus = (id) => {
    FetchBonuses.deleteBonusById(id)
            .then( deletedBonus => {
                BonusesStorage.deleteBonus(deletedBonus.deletedBonus);
                this.setState(prev => ({
                    bonuses: JSON.parse(BonusesStorage.getBonuses()),
                    confirmationVisible: true,
                    confirmationMessage: "Bonus removed"
                }));
            });
};


startEdit = (bonus) => {
    this.setState({ editingBonus: bonus });
};

saveEdit = (updateBonus) => {
    FetchBonuses.patchBonusById(updateBonus, updateBonus.id)
        .then(patchedBonus => {

            BonusesStorage.editBonus(patchedBonus);
            this.setState({
                bonuses: JSON.parse(BonusesStorage.getBonuses())
            });
        })
        .catch(err => console.log(err))
};


cancelEdit = () => {
this.setState({ editingBonus: null });
};

render() {
    const { bonuses, editingBonus } = this.state;
    const today = new Date(); 
    let current = [];
    let past = [];

    for(const yearKey in bonuses){
        if(Number(yearKey) === today.getFullYear()){
            let current_bonuses = bonuses[yearKey][today.getMonth()];

            for(const monthKey in current_bonuses){
                if(new Date (current_bonuses[monthKey].start_date) <= today && new Date(current_bonuses[monthKey].end_date) >= today){
                    current.push(current_bonuses[monthKey])
                }
            }
        };

        const months = bonuses[yearKey];

        for (const monthKey in months) {
            const monthBonuses = months[monthKey];

            for (const b of monthBonuses) {
                if (new Date(b.end_date) <= today) {
                    past.push(b);
                }
            }
        }
    }
    
    return (
    <div className="bonuses-page fade-in">
    <h1 className="title">Sales Bonuses</h1>

    <ConfirmationMessage
        message={this.state.confirmationMessage}
        visible={this.state.confirmationVisible}
        onClose={this.onCloseConfirmation}
    />

    {TokenService.getToken() ? (
        <button className="toggle-form-btn" onClick={this.toggleForm}>
        {this.state.showForm ? "Hide Form" : "Add New Bonus"}
    </button>
    ) : ""}

    {this.state.showForm && <BonusForm
    onAdd={this.addBonus}
    onSaveEdit={this.saveEdit}
    editingBonus={editingBonus}
    onCancel={this.cancelEdit}
    />}
    
    
    <section>
    <h2 className="section-title">Current Bonuses</h2>
    <BonusesList newlyAddedId={this.state.newlyAddedId}  bonuses={current} onRemove={this.removeBonus} onEdit={this.startEdit}  onSaveEdit={this.saveEdit} expandList={this.state.expandList} expandLists={this.expandLists} toggleExpandList={this.toggleExpandList} current_bonuses={true}/>
    </section>
    
    
    <section>
    <h2 className="section-title">Past Bonuses</h2>
    <BonusesList newlyAddedId={this.state.newlyAddedId}  bonuses={past} onRemove={this.removeBonus} onEdit={this.startEdit} onSaveEdit={this.saveEdit} expandList={this.state.expandList} expandLists={this.expandLists} toggleExpandList={this.toggleExpandList} past_bonuses={true}/>
    </section>
    </div>
    );
    }
    }