import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "./logout-button/logout-button";
import logo from "./logo.png";
import profilePic from "./profile.jpeg";
import "./header.scss";
import "./header-mobile.scss";

function Header() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (showDropdown) {
      setShowDropdown(false);
    }
  }, [location]);

  return (
    <div className="header-component">
      <div className="left">
        <Link to="/" className="logo-container nav-link">
          <img src={logo} alt="black GymSpot logo" />
          <h1>GymSpot</h1>
        </Link>
      </div>

      <div className="buttons">
        <div className="links">
          <Link to="/gym" className="nav-link">
            Gym
          </Link>
          <Link to="/diet" className="nav-link">
            Diet
          </Link>
          <Link to="/progress" className="nav-link">
            Progress
          </Link>
        </div>

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="profile-button"
        >
          <img src={profilePic} alt="profile" />
        </button>

        {showDropdown && (
          <div className="dropdown">
            <Link to="/profile" className="nav-link desktop-nav-link">
              Settings
            </Link>
            <Link to="/profile" className="mobile-nav-link">
              personal information
            </Link>
            <Link to="/profile/account" className="mobile-nav-link">
              account settings
            </Link>
            <Link to="/profile/contact" className="mobile-nav-link">
              contact support
            </Link>
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
