import Pantry from "../../components/pantry/pantry";
import DietLog from "../../components/dietlog/dietlog";
import PastLogs from "../../components/past-logs/past-logs";
import "./diet.scss";

function Diet() {
  return (
    <div className="diet-page">
      <Pantry />
      <DietLog />
      <PastLogs />
    </div>
  );
}

export default Diet;
