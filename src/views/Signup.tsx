import { useState, type FormEvent } from "react";
import Dashboard from "./Dashboard";

import "../App.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setMessage("Sign up successful!");
        setLoggedIn(true);
      } else {
        setMessage("Sign up failed. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
    }
  };
  const handleLogout = async (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(
        "https://frontend-take-home-service.fetch.com/auth/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setMessage("Sign up successful!");
        setLoggedIn(true);
      } else {
        setMessage("Sign up failed. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div>
      {!loggedIn ? (
        <>
          <div className="signup-container">
            <img
              id="register-logo"
              src="https://cdn.brandfetch.io/id7Cm60rQf/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B"
              alt="Fetch Rewards Logo"
            />
            <h2 className="signup-title">Sign Up</h2>
            <div className="form">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  Sign Up
                </button>
              </form>
            </div>
            {message && <p className="message">{message}</p>}
            {loading && (
              <div className="load-container">
                <div className="load"></div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <button id="logout" onClick={handleLogout}>
            Logout
          </button>
          <Dashboard />
          
        </>
      )}
    </div>
  );
}

export default Signup;
