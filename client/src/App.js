import { Outlet } from "react-router-dom";
import Header from "./components/header/header";
import "./App.scss";

function App() {
  return (
    <div className="App">
      <Header />
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
