import React, { Component } from "react";
import BonusesList from "./BonusesList/BonusesList";
import BonusForm from "./BonusesForm/BonusesForm";
import "./BonusesPage.css";
import FetchBonuses from "../../Services/FetchServices/FetchBonuses";
import ConfirmationMessage from "../ConfrimationMessage/ConfirmationMessage";
import BonusesStorage from "../../Services/StorageService/BonusesStorage";

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
        expandList: false
    };
}


componentDidMount(){
}

toggleForm = () => {
    this.setState((prev) => ({ showForm: !prev.showForm }));
  };

  addBonus = (bonus) => {
    // Example: send to backend then update state
    this.setState((prev) => ({
      bonuses: [...prev.bonuses, { ...bonus, id: Date.now() }],
      showForm: false, // hide form after adding,
      expandList: true
    }));
  };

  removeBonus = (id) => {
    this.setState((prev) => ({
      bonuses: prev.bonuses.filter((b) => b.id !== id),
    }));
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
            BonusesStorage.setBonuses([...this.state.bonuses, saved.createdBonus])
            this.setState(
                prev => ({
                  bonuses: [...prev.bonuses, saved.createdBonus],
                  confirmationVisible: true,
                  confirmationMessage: "Bonus added successfully!",
                  expandList: true
                })
              );
        })
        .catch(err => console.error("Error adding bonus", err));
};

removeBonus = (id) => {
    FetchBonuses.deleteBonusById(id)
            .then( deletedBonus => {
                const updatedBonus = this.state.bonuses.filter(b => b.id !== id)
                BonusesStorage.setBonuses(updatedBonus);
                this.setState(prev => ({
                    bonuses: updatedBonus,
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
            const bonusIndex = this.state.bonuses.findIndex( bonus => Number(bonus.id) === Number(patchedBonus.id))
            const bonuses = this.state.bonuses;

            bonuses[bonusIndex] = patchedBonus;

            BonusesStorage.setBonuses(bonuses);
            this.setState({bonuses});
        })
        .catch(err => console.log(err))
};


cancelEdit = () => {
this.setState({ editingBonus: null });
};

render() {
    const { bonuses, editingBonus } = this.state;
    const today = new Date();   
    const current = bonuses.filter((b) => today >= new Date(b.start_date) && today <= new Date(b.end_date));
    const past = bonuses.filter((b) => new Date(b.end_date) < today);
    
    return (
    <div className="bonuses-page fade-in">
    <h1 className="title">Sales Bonuses</h1>

    <ConfirmationMessage
        message={this.state.confirmationMessage}
        visible={this.state.confirmationVisible}
        onClose={this.onCloseConfirmation}
    />

    <button className="toggle-form-btn" onClick={this.toggleForm}>
        {this.state.showForm ? "Hide Form" : "Add New Bonus"}
    </button>

    {this.state.showForm && <BonusForm
    onAdd={this.addBonus}
    onSaveEdit={this.saveEdit}
    editingBonus={editingBonus}
    onCancel={this.cancelEdit}
    />}
    
    
    <section>
    <h2 className="section-title">Current Bonuses</h2>
    <BonusesList  bonuses={current} onRemove={this.removeBonus} onEdit={this.startEdit}  onSaveEdit={this.saveEdit} expandList={this.state.expandList} expandLists={this.expandLists} toggleExpandList={this.toggleExpandList} current_bonuses={true}/>
    </section>
    
    
    <section>
    <h2 className="section-title">Past Bonuses</h2>
    <BonusesList bonuses={past} onRemove={this.removeBonus} onEdit={this.startEdit} onSaveEdit={this.saveEdit} expandList={this.state.expandList} expandLists={this.expandLists} toggleExpandList={this.toggleExpandList} past_bonuses={true}/>
    </section>
    </div>
    );
    }
    }