import React, { Component } from "react";
import "./BonusesList.css";

export default class BonusesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedMonths: {},
      editingId: null,
      editCriteria: "",
      editAmount: "",
      editStart: "",
      editEnd: ""
    };
  }

  // ───────────────────────────────
  // Month toggle
  // ───────────────────────────────
  toggleMonth = (monthKey) => {
    this.setState((prev) => ({
      expandedMonths: {
        ...prev.expandedMonths,
        [monthKey]: !prev.expandedMonths[monthKey]
      }
    }));
  };

  // ───────────────────────────────
  // Group bonuses by month
  // ───────────────────────────────
  groupByMonth = (bonuses) => {
    const groups = {};
    bonuses.forEach((b) => {
      const date = new Date(b.start_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return groups;
  };

  // ───────────────────────────────
  // Start inline editing
  // ───────────────────────────────
  startEdit = (bonus) => {
    this.setState({
      editingId: bonus.id,
      editCriteria: bonus.criteria,
      editAmount: bonus.amount,
      editStart: bonus.start_date.split("T")[0],
      editEnd: bonus.end_date.split("T")[0]
    });
  };

  // ───────────────────────────────
  // Submit inline edit
  // ───────────────────────────────
  saveEdit = () => {
    const { editingId, editCriteria, editAmount, editStart, editEnd } = this.state;

    this.props.onSaveEdit({
      id: Number(editingId),
      criteria: editCriteria,
      amount: parseInt(editAmount, 10),
      start_date: editStart,
      end_date: editEnd
    });

    this.setState({
      editingId: null
    });
  };

  // ───────────────────────────────
  // Cancel inline editing
  // ───────────────────────────────
  cancelEdit = () => {
    this.setState({ editingId: null });
  };

  // ───────────────────────────────
  // Render
  // ───────────────────────────────
  render() {
    const { bonuses, onRemove } = this.props;
    const { expandedMonths, editingId } = this.state;

    const today = new Date();
    const grouped = this.groupByMonth(bonuses);
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    return (
      <div className="bonuses-list">
        {Object.keys(grouped).length === 0 && (
          <p className="empty">No bonuses to display.</p>
        )}

        {Object.keys(grouped).sort().map((monthKey) => {
          const [year, monthIndex] = monthKey.split("-");
          const label = `${monthNames[parseInt(monthIndex)-1]} ${year}`;
          const isExpanded = expandedMonths[monthKey];

          return (
            <div key={monthKey} className="month-group">
              <div className="month-header" onClick={() => this.toggleMonth(monthKey)}>
                <h3>{label}</h3>
                <span className="toggle-icon">{isExpanded ? "▼" : "▶"}</span>
              </div>

              {isExpanded &&
                grouped[monthKey].map((b) => {
                  const endDate = new Date(b.end_date);
                  const canEdit = today <= endDate;

                  // ───────────────────────────────────────
                  // IF THIS BONUS IS IN EDIT MODE
                  // ───────────────────────────────────────
                  if (editingId === b.id) {
                    return (
                      <div key={b.id} className="bonus-item editing pop-in">
                        <input
                          type="text"
                          value={this.state.editCriteria}
                          onChange={(e) => this.setState({ editCriteria: e.target.value })}
                        />
                        <input
                          type="number"
                          value={this.state.editAmount}
                          onChange={(e) => this.setState({ editAmount: e.target.value })}
                        />

                        <label>End</label>
                        <input
                          type="date"
                          value={this.state.editEnd}
                          onChange={(e) => this.setState({ editEnd: e.target.value })}
                        />

                        <div className="edit-actions">
                          <button className="save-btn" onClick={this.saveEdit}>
                            Save
                          </button>
                          <button className="cancel-btn" onClick={this.cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // ───────────────────────────────────────
                  // NORMAL BONUS VIEW
                  // ───────────────────────────────────────
                  return (
                    <div key={b.id} className="bonus-item pop-in">
                      <div className="bonus-header">
                        <h4>{b.criteria}</h4>

                        <div className="actions">
                          {canEdit && (
                            <button className="edit-btn" onClick={() => this.startEdit(b)}>
                              Edit
                            </button>
                          )}

                          <button className="remove-btn" onClick={() => onRemove(b.id)}>
                            ×
                          </button>
                        </div>
                      </div>

                      <p className="amount">${b.amount}</p>
                      <p className="dates">{b.start_date.split("T")[0]} → {b.end_date.split("T")[0]}</p>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    );
  }
}
