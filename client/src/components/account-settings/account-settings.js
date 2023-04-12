import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { OutlinedInput, FormLabel } from "@mui/material";
import { fetchProfile, updateAccount } from "../../helpers/users";
import "./account-settings.scss";
import "./account-settings_mobile.scss";

function AccountSettings() {
  const [cookies, setCookies] = useCookies();
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    if (cookies.userId) {
      fetchProfile(cookies.userId).then((res) => {
        if (res.type === "success") {
          setEmail(res.data[0].email);
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  const handleProfileUpdate = () => {
    if (cookies.userId) {
      if (newEmail !== confirmNewEmail) {
        alert("New email addresses do not match, please try again");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        alert("New passwords do not match, please try again");
        return;
      }

      updateAccount(
        email,
        newEmail,
        password,
        newPassword,
        cookies.userId
      ).then((res) => {
        if (res.type === "success") {
          alert("Account information updated successfully!");
          window.location.reload();
        } else {
          alert(
            "Error updating account information, please check that your current email and password are correct and then try again"
          );
          console.error(res);
        }
      });
    } else {
      alert(
        "Error loading credentials, please refresh the screen and try again"
      );
    }
  };

  return (
    <div className="account-settings">
      <h5>Account Settings</h5>
      <form>
        <div className="row">
          <FormLabel>Current Email</FormLabel>
          <OutlinedInput
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
        </div>

        <div className="col">
          <div className="row">
            <FormLabel>New Email</FormLabel>
            <OutlinedInput
              placeholder="new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              fullWidth
            />
          </div>
          <div className="row">
            <FormLabel>Confirm New Email</FormLabel>
            <OutlinedInput
              placeholder="confirm new email"
              value={confirmNewEmail}
              onChange={(e) => setConfirmNewEmail(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        <div className="row">
          <FormLabel>Current Password</FormLabel>
          <OutlinedInput
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            type="password"
          />
        </div>

        <div className="col">
          <div className="row">
            <FormLabel>New Password</FormLabel>
            <OutlinedInput
              placeholder="new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              type="password"
            />
          </div>
          <div className="row">
            <FormLabel>Confirm New Password</FormLabel>
            <OutlinedInput
              placeholder="confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              fullWidth
              type="password"
            />
          </div>
        </div>
      </form>

      <button onClick={() => handleProfileUpdate()}>Update Account</button>
    </div>
  );
}

export default AccountSettings;
