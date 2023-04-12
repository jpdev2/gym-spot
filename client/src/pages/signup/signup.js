import { useState } from "react";
import { Link } from "react-router-dom";
import {
  OutlinedInput,
  TextField,
  Typography,
  FormLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/lab";
import { signup } from "../../helpers/users";
import logo from "./logo.png";
import "./signup.scss";
import "./signup_mobile.scss";

function Signup() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [gender, setGender] = useState("gender");
  const [heightFeet, setHeightFeet] = useState("feet");
  const [heightInches, setHeightInches] = useState("inches");
  const [weight, setWeight] = useState("");
  const [workouts, setWorkouts] = useState("days");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const dobMonth = birthdate.getMonth() + 1;
    const dobDate = birthdate.getDate();
    const dobYear = birthdate.getFullYear();

    const dob = `${dobMonth >= 10 ? dobMonth : `0${dobMonth}`}/${
      dobDate >= 10 ? dobDate : `0${dobDate}`
    }/${dobYear}`;

    signup(
      firstname,
      lastname,
      email,
      dob,
      gender,
      parseInt(heightFeet) * 12 + parseInt(heightInches),
      parseInt(weight),
      workouts,
      "maintenance",
      password
    ).then((res) => {
      if (res.type === "success") {
        alert(
          "You have sucessfully created a GymSpot account. Please use the login page to login to your account."
        );
        window.location = "/login";
      } else {
        alert(
          `We've encountered an error creating a new account for you. Please try to sign up again.`
        );
        console.error(res);
      }
    });
  };

  return (
    <div className="signup-page">
      <div className="header">
        <div className="logo">
          <img src={logo} alt="white GymSpot logo" />
          <h1>GymSpot</h1>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        <h1>Sign Up for Your Account</h1>
        <div className="form-grid">
          <div className="col">
            <h2>Account Details</h2>
            <div className="row">
              <div className="input-container">
                <FormLabel>First Name</FormLabel>
                <OutlinedInput
                  placeholder="first name"
                  fullWidth
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </div>
              <div className="input-container">
                <FormLabel>Last Name</FormLabel>
                <OutlinedInput
                  placeholder="last name"
                  fullWidth
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="input-container wide-input">
                <FormLabel>Email</FormLabel>
                <OutlinedInput
                  placeholder="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="input-container">
                <FormLabel>Password</FormLabel>
                <OutlinedInput
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
              </div>
              <div className="input-container">
                <FormLabel>Confirm Password</FormLabel>
                <OutlinedInput
                  type="password"
                  placeholder="password"
                  value={confirmedPassword}
                  onChange={(e) => setConfirmedPassword(e.target.value)}
                  fullWidth
                />
              </div>
            </div>
          </div>
          <div className="col">
            <h2>Personal Information</h2>
            <div className="row">
              <div className="input-container">
                <FormLabel>Birthdate</FormLabel>
                <DatePicker
                  views={["day", "month", "year"]}
                  value={birthdate}
                  onChange={(newDate) => {
                    setBirthdate(newDate);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} helperText={null} />
                  )}
                  fullWidth
                />
              </div>
              <div className="input-container">
                <FormLabel>Gender</FormLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <MenuItem value="gender" disabled>
                    gender
                  </MenuItem>
                  <MenuItem value="male">male</MenuItem>
                  <MenuItem value="female">female</MenuItem>
                </Select>
              </div>
            </div>

            <div className="row">
              <div className="input-container">
                <FormLabel>Height (ft)</FormLabel>
                <Select
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="feet" key="feet" disabled>
                    feet
                  </MenuItem>
                  {[...Array(8).keys()]
                    .map((i) => i + 1)
                    .map((foot) => {
                      return (
                        <MenuItem value={foot} key={foot}>
                          {foot}
                        </MenuItem>
                      );
                    })}
                </Select>
              </div>
              <div className="input-container">
                <FormLabel>Height (in)</FormLabel>
                <Select
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="inches" key="inches" disabled>
                    inches
                  </MenuItem>
                  {[...Array(12).keys()]
                    .map((i) => i)
                    .map((inch) => {
                      return (
                        <MenuItem value={inch} key={inch}>
                          {inch}
                        </MenuItem>
                      );
                    })}
                </Select>
              </div>
            </div>

            <div className="row">
              <div className="input-container">
                <FormLabel>Weight (lbs)</FormLabel>
                <OutlinedInput
                  placeholder="lbs"
                  fullWidth
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="input-container">
                <FormLabel>Workouts (per week)</FormLabel>
                <Select
                  value={workouts}
                  onChange={(e) => setWorkouts(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="days" key="0" disabled>
                    days
                  </MenuItem>
                  {[...Array(7).keys()]
                    .map((i) => i + 1)
                    .map((day) => {
                      return (
                        <MenuItem value={day} key={day}>
                          {day}
                        </MenuItem>
                      );
                    })}
                </Select>
              </div>
            </div>
          </div>
        </div>

        <button type="submit">Sign Up</button>

        <div className="links">
          <Typography>Already have an account?</Typography>
          <Link to="/login">
            <Typography>Login</Typography>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Signup;
