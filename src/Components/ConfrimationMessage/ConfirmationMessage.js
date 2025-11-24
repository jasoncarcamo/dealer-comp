import React, { Component } from "react";
import "./ConfirmationMessage.css";

export default class ConfirmationMessage extends Component {
  render() {
    const { message, visible, onClose } = this.props;
    return (
      <div className={`confirmation-message ${visible ? "show" : ""}`}>
        <span>{message}</span>
        <button className="ok-btn" onClick={onClose}>OK</button>
      </div>
    );
  }
}