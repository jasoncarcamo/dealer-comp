import React from "react";
import "./LogIn.css";

export default class LogIn extends React.Component{
    render(){
        return(
            <div className="login-wrapper">
                <div className="login-card">
                    <h2>Login</h2>

                    <form>
                        <div className="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" placeholder="Enter username" />
                        </div>

                        <div className="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" placeholder="Enter password" />
                        </div>

                        <button type="submit" className="login-btn">Login</button>
                    </form>
                </div>
            </div>
        );
    };
};