import { useCookies } from "react-cookie";

function ProtectedRoute({ component: Component }) {
  const [cookies, setCookies] = useCookies();

  if (cookies.userId === null || cookies.userId === undefined) {
    window.location = "/login";
  }

  return <Component />;
}

export default ProtectedRoute;
