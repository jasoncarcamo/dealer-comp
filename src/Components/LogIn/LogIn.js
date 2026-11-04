
import React from "react";
import "./LogIn.css";
import FetchAdmin from "../../Services/FetchServices/FetchAdmin";
import TokenService from "../../Services/StorageService/TokenService";
import { Navigate } from "react-router-dom";

export default class LogIn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user_name: "",
            password: "",
            showPassword: false,
            loading: false,
            redirect: false,
            error: "",
            showSuccess: false
        };

        this.redirectTimer = null;
        this.isMountedFlag = false;
    }

    componentDidMount() {
        this.isMountedFlag = true;
    }

    componentWillUnmount() {
        this.isMountedFlag = false;

        if (this.redirectTimer) {
            clearTimeout(this.redirectTimer);
        }
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
            error: ""
        });
    };

    togglePassword = () => {
        this.setState((previousState) => ({
            showPassword: !previousState.showPassword
        }));
    };

    handleForm = async (event) => {
        event.preventDefault();

        const { user_name, password, loading } = this.state;

        if (loading) {
            return;
        }

        if (!user_name.trim() || !password) {
            this.setState({
                error: "Please enter your username and password."
            });

            return;
        }

        this.setState({
            loading: true,
            error: ""
        });

        try {
            const dbAdmin = await FetchAdmin.loginAdmin({
                user_name: user_name.trim(),
                password
            });

            if (!this.isMountedFlag) {
                return;
            }

            if (!dbAdmin || !dbAdmin.token) {
                this.setState({
                    loading: false,
                    error: "Invalid username or password."
                });

                return;
            }

            TokenService.setToken(dbAdmin.token);

            this.setState({
                user_name: "",
                password: "",
                loading: false,
                error: "",
                showSuccess: true
            });

            this.redirectTimer = setTimeout(() => {
                if (this.isMountedFlag) {
                    this.setState({
                        showSuccess: false,
                        redirect: true
                    });
                }
            }, 1500);

        } catch (error) {
            if (!this.isMountedFlag) {
                return;
            }

            this.setState({
                loading: false,
                error: "Unable to log in. Please check your credentials and try again."
            });
        }
    };

    render() {
        const {
            user_name,
            password,
            showPassword,
            loading,
            redirect,
            error,
            showSuccess
        } = this.state;

        if (redirect) {
            return <Navigate to="/bonuses" replace />;
        }

        return (
            <main className="login-wrapper">
                <section
                    className="login-card"
                    aria-labelledby="login-title"
                >
                    <div className="login-card__header">
                        <span className="login-card__eyebrow">
                            Administration
                        </span>

                        <h1 id="login-title">
                            Welcome back
                        </h1>

                        <p>
                            Sign in to access your dashboard.
                        </p>
                    </div>

                    {showSuccess && (
                        <div
                            className="login-success"
                            role="status"
                        >
                            Logged in successfully! Redirecting...
                        </div>
                    )}

                    <form onSubmit={this.handleForm}>
                        <div className="form-group">
                            <label htmlFor="user_name">
                                Username
                            </label>

                            <input
                                type="text"
                                id="user_name"
                                name="user_name"
                                value={user_name}
                                onChange={this.handleChange}
                                placeholder="Enter your username"
                                autoComplete="username"
                                required
                                disabled={loading || showSuccess}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="login-password-field">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={this.handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                    disabled={loading || showSuccess}
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={this.togglePassword}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div
                                className="login-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading || showSuccess}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </section>
            </main>
        );
    }
}
