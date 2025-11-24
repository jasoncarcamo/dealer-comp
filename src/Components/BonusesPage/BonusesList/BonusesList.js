import React, { Component } from "react";
import "./BonusesList.css";

export default class BonusesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedMonths: {}
    };
  }

  toggleMonth = (monthKey) => {
    this.setState((prev) => ({
      expandedMonths: {
        ...prev.expandedMonths,
        [monthKey]: !prev.expandedMonths[monthKey]
      }
    }));
  };

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

  render() {
    const { bonuses, onRemove, onEdit } = this.props;
    const { expandedMonths } = this.state;
    const today = new Date();

    const grouped = this.groupByMonth(bonuses);
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    console.log(grouped)
    return (
      <div className="bonuses-list">
        {Object.keys(grouped).length === 0 && <p className="empty">No bonuses to display.</p>}

        {Object.keys(grouped).sort().map((monthKey) => {
          const [year, monthIndex] = monthKey.split("-");
          const monthLabel = `${monthNames[parseInt(monthIndex)-1]} ${year}`;
          const isExpanded = expandedMonths[monthKey] || false;

          return (
            <div key={monthKey} className="month-group">
              <div className="month-header" onClick={() => this.toggleMonth(monthKey)}>
                <h3>{monthLabel}</h3>
                <span className="toggle-icon">{isExpanded ? "▼" : "▶"}</span>
              </div>

              {isExpanded && grouped[monthKey].sort((a, b) => new Date(b.date_created < new Date(a.date_created))).map((b) => {
                const endDate = new Date(b.end_date);
                const canEdit = today <= endDate; // Only edit if today <= bonus end date

                return (
                  <div key={b.id} className="bonus-item pop-in">
                    <div className="bonus-header">
                      <h4>{b.criteria}</h4>
                      <div>
                        {canEdit && <button className="edit-btn" onClick={() => onEdit(b)}>Edit</button>}
                        <button className="remove-btn" onClick={() => onRemove(b.id)}>×</button>
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
