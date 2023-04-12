import { Outlet, Link, useLocation } from "react-router-dom";
import "./profile.scss";
import "./profile_mobile.scss";

function Profile() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="profile-page">
      <div className="layout">
        <div className="links">
          <Link
            to=""
            className={path === "/profile" ? "link selected" : "link"}
          >
            personal information
          </Link>
          <Link
            to="account"
            className={path === "/profile/account" ? "link selected" : "link"}
          >
            account settings
          </Link>
          <Link
            to="contact"
            className={path === "/profile/contact" ? "link selected" : "link"}
          >
            contact support
          </Link>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Profile;
