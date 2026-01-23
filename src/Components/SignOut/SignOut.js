import React from "react";
import { Navigate } from "react-router-dom";
import TokenService from "../../Services/StorageService/TokenService";
import "./SignOut.css";

export default class SignOut extends React.Component {
  state = {
    showConfirmation: true,  // show Yes/No initially
    showSuccess: false,
    redirect: false,
  };

  handleSignOut = () => {
    // Remove token
    TokenService.removeToken();

    // Hide confirmation, show success
    this.setState({ showConfirmation: false, showSuccess: true });

    // Redirect after 1.5s
    setTimeout(() => {
      this.setState({ redirect: true });
    }, 1500);
  };

  handleCancel = () => {
    this.setState({ redirect: true }); // go back or to login
  };

  render() {
    if (this.state.redirect) {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="signout-wrapper">
        {this.state.showConfirmation && (
          <div className="signout-box">
            <p>Are you sure you want to sign out?</p>
            <div className="signout-buttons">
              <button className="signout-yes" onClick={this.handleSignOut}>
                Yes
              </button>
              <button className="signout-no" onClick={this.handleCancel}>
                No
              </button>
            </div>
          </div>
        )}

        {this.state.showSuccess && (
          <div className="signout-success">
            Signed out successfully!
          </div>
        )}
      </div>
    );
  }
};