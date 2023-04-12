import Exercises from "../../components/exercises/exercises";
import Workouts from "../../components/workouts/workouts";
import "./gym.scss";

function Gym() {
  return (
    <div className="gym-page">
      <Exercises />
      <Workouts />
    </div>
  );
}

export default Gym;
