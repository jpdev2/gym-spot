import { useState } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { OutlinedInput, Typography } from "@mui/material";
import { login } from "../../helpers/auth";
import logo from "./logo.png";
import "./login.scss";
import "./login_mobile.scss";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cookies, setCookies] = useCookies(["user"]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password).then((response) => {
      if (response.type === "success") {
        // stores jwt in cookie (expires in 60 minutes)
        let expiryDate = new Date(new Date().getTime() + 60 * 60 * 1000);
        setCookies("jwt", response.data[0], { path: "/", expires: expiryDate });
        setCookies("userId", response.data[1], {
          path: "/",
          expires: expiryDate,
        });

        window.location = "/";
      } else {
        alert(
          "Error logging in. Please check your email and password and try again."
        );
      }
    });
  };

  return (
    <div className="login-page">
      <div className="header">
        <div className="logo">
          <img src={logo} alt="black GymSpot logo" />
          <h1>GymSpot</h1>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        <h1>Login to Your Account</h1>
        <OutlinedInput
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          className="form-input"
        />
        <OutlinedInput
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          className="form-input"
        />
        <button type="submit">Login</button>
        <div className="links">
          <Typography>Don't have an account?</Typography>
          <Link to="/signup">
            <Typography>Sign Up</Typography>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
