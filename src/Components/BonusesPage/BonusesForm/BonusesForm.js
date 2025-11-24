import React, { Component } from "react";
import "./BonusesForm.css";

export default class BonusForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      criteria: "",
      amount: "",
      startDate: "",
      endDate: "",
      error: ""
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.editingBonus &&
      prevProps.editingBonus !== this.props.editingBonus
    ) {
      const { criteria, amount, start_date, end_date } = this.props.editingBonus;
      this.setState({
        criteria,
        amount,
        startDate: start_date.split("T")[0],
        endDate: end_date.split("T")[0]
      });
    }
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: "" });
  };

  validate = () => {
    const { criteria, amount, startDate, endDate } = this.state;
    if (!criteria || !amount || !startDate || !endDate)
      return "All fields are required.";
    if (parseFloat(amount) <= 0) return "Amount must be positive.";
    if (new Date(startDate) > new Date(endDate))
      return "Start date must be before end date.";
    return "";
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const error = this.validate();
    if (error) return this.setState({ error });

    const bonus = {
      id: this.props.editingBonus ? this.props.editingBonus.id : undefined,
      criteria: this.state.criteria,
      amount: parseInt(this.state.amount, 10),
      start_date: this.state.startDate,
      end_date: this.state.endDate,
      date_created: new Date()
    };

    this.props.onAdd(bonus);

    this.setState({ criteria: "", amount: "", startDate: "", endDate: "", error: "" });
  };

  render() {
    const editing = !!this.props.editingBonus;

    return (
      <form className="bonus-form drop-down" onSubmit={this.handleSubmit}>
        <h3 className="form-title">{editing ? "Edit Bonus" : "Add Bonus"}</h3>
        {this.state.error && <p className="error">{this.state.error}</p>}

        <input
          type="number"
          name="amount"
          placeholder="Bonus ($)"
          value={this.state.amount}
          onChange={this.handleChange}
        />
        <input
          type="text"
          name="criteria"
          placeholder="Criteria"
          value={this.state.criteria}
          onChange={this.handleChange}
        />

        <label>Start Date</label>
        <input
          type="date"
          name="startDate"
          value={this.state.startDate}
          onChange={this.handleChange}
        />

        <label>End Date</label>
        <input
          type="date"
          name="endDate"
          value={this.state.endDate}
          onChange={this.handleChange}
        />

        <div className="form-buttons">
          <button type="submit" className="submit-btn">
            {editing ? "Save Changes" : "Add Bonus"}
          </button>
        </div>
      </form>
    );
  }
}
