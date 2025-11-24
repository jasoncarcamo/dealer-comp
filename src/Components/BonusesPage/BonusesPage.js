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
    };
}


componentDidMount(){
}

onCloseConfirmation = () => {
    this.setState({ confirmationVisible: false, confirmationMessage: "" });
};

addBonus = (bonus) => {
    console.log(bonus)
    FetchBonuses.createBonus(bonus)
        .then(saved => {
            console.log(saved)
            BonusesStorage.setBonuses([...this.state.bonuses, saved.createdBonus])
            this.setState(
                prev => ({
                  bonuses: [...prev.bonuses, saved.createdBonus],
                  confirmationVisible: true,
                  confirmationMessage: "Bonus added successfully!"
                }),
                () => {
                  setTimeout(() => this.setState({ confirmationVisible: false, confirmationMessage: "" }), 5000);
                }
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
                  }),
                  () => {
                    setTimeout(() => this.setState({ confirmationVisible: false, confirmationMessage: "" }), 5000);
                  });
            });
};


startEdit = (bonus) => {
this.setState({ editingBonus: bonus });
};


saveEdit = (updatedBonus) => {
};


cancelEdit = () => {
this.setState({ editingBonus: null });
};

render() {
    const { bonuses, editingBonus } = this.state;
    const today = new Date();
    console.log(bonuses)
    
    const current = bonuses.filter((b) => today >= new Date(b.start_date) && today <= new Date(b.end_date));
    const past = bonuses.filter((b) => new Date(b.end_date) < today);
    
    console.log(current.length)
    return (
    <div className="bonuses-page fade-in">
    <h1 className="title">Sales Bonuses</h1>

    <ConfirmationMessage
        message={this.state.confirmationMessage}
        visible={this.state.confirmationVisible}
        onClose={this.onCloseConfirmation}
    />

    <BonusForm
    onAdd={this.addBonus}
    onSaveEdit={this.saveEdit}
    editingBonus={editingBonus}
    onCancel={this.cancelEdit}
    />
    
    
    <section>
    <h2 className="section-title">Current Bonuses</h2>
    <BonusesList  bonuses={current} onRemove={this.removeBonus} onEdit={this.startEdit} />
    </section>
    
    
    <section>
    <h2 className="section-title">Past Bonuses</h2>
    <BonusesList bonuses={past} onRemove={this.removeBonus} onEdit={this.startEdit} />
    </section>
    </div>
    );
    }
    }