import React from "react";
import "./LogIn.css";
import FetchAdmin from "../../Services/FetchServices/FetchAdmin";
import TokenService from "../../Services/StorageService/TokenService";
import { Navigate, redirect } from "react-router-dom";

export default class LogIn extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            user_name: "",
            password: "",
            redirect: false,
            error: "",
            showSuccess: false
        }
    }

    handleChange = (e)=>{
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleForm = (e)=>{
        e.preventDefault();

        const admin ={
            user_name: this.state.user_name,
            password: this.state.password
        }

        FetchAdmin.loginAdmin(admin)
            .then(dbAdmin => {
                if (!dbAdmin.token) {
                    this.setState({ error: "Invalid username or password" });
                    return;
                }

                TokenService.setToken(dbAdmin.token);

                this.setState({
                    user_name: "",
                    password: "",
                    redirect: false,
                    error: "", // clear previous error,
                    showSuccess: true
                });

                setTimeout(() => {
                    this.setState({ showSuccess: false, redirect: true });
                  }, 1500);
            })
            .catch(err => {
                this.setState({ error: "Server error. Please try again." });
            });
    }

    render(){
        console.log(this.state)
        if (this.state.redirect) {
            return <Navigate to="/bonuses" replace />;
        };

        return(
            <div className="login-wrapper">

                {this.state.showSuccess && (
                <div className="login-success">
                    Logged in successfully!
                </div>
                )}

                <div className="login-card">
                    <h2>Login</h2>

                    <form onSubmit={this.handleForm}>
                        <div className="form-group">
                            <label htmlFor="user_name">Username</label>
                            <input type="text" id="user_name" name="user_name" value={this.state.user_name} onChange={this.handleChange} placeholder="Enter username" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" value={this.state.password} onChange={this.handleChange} placeholder="Enter password" />
                        </div>

                        {this.state.error && (
                            <div className="login-error">{this.state.error}</div>
                        )}

                        <button type="submit" className="login-btn">Login</button>
                    </form>
                </div>
            </div>
        );
    };
};