import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DateAdapter from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import App from "./App";
import ProtectedRoute from "./components/protected-route/protected-route";
import Login from "./pages/login/login";
import Signup from "./pages/signup/signup";
import Home from "./pages/home/home";
import Diet from "./pages/diet/diet";
import Gym from "./pages/gym/gym";
import Progress from "./pages/progress/progress";
import Profile from "./pages/profile/profile";
import PersonalSettings from "./components/personal-settings/personal-settings";
import AccountSettings from "./components/account-settings/account-settings";
import ContactSupport from "./components/contact-support/contact-support";

ReactDOM.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={DateAdapter}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>

          <Route path="/" element={<ProtectedRoute component={App} />}>
            <Route path="" element={<ProtectedRoute component={Home} />} />
            <Route path="gym" element={<ProtectedRoute component={Gym} />} />
            <Route path="diet" element={<ProtectedRoute component={Diet} />} />
            <Route
              path="progress"
              element={<ProtectedRoute component={Progress} />}
            />
            <Route
              path="profile"
              element={<ProtectedRoute component={Profile} />}
            >
              <Route
                path=""
                element={<ProtectedRoute component={PersonalSettings} />}
              />
              <Route
                path="account"
                element={<ProtectedRoute component={AccountSettings} />}
              />
              <Route
                path="contact"
                element={<ProtectedRoute component={ContactSupport} />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </LocalizationProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
