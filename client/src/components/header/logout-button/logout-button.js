import { useCookies } from "react-cookie";
import { logout } from "../../../helpers/auth";
import { deleteAllCookies } from "../../../util/cookies";
import "./logout-button.scss";

function LogoutButton() {
  const [cookies, setCookies] = useCookies(["user"]);

  const handleLogout = () => {
    logout(cookies.jwt).then((res) => {
      if (res.type === "success") {
        deleteAllCookies();
        window.location = "/login";
      } else {
        console.error(res);
      }
    });
  };

  return (
    <button onClick={() => handleLogout()} className="logout-button">
      logout
    </button>
  );
}

export default LogoutButton;
