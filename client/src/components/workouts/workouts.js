import { Modal } from "@mui/material";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { getWorkoutsByUserId } from "../../helpers/workouts";
import EditWorkout from "./edit-workout/edit-workout";
import Workout from "./workout/workout";
import "./workouts.scss";

function Workouts() {
  const [cookies, setCookies] = useCookies(["user"]);
  const [workouts, setWorkouts] = useState([]);
  const [dates, setDates] = useState([]);
  const [editing, setEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [workoutsEditing, setWorkoutsEditing] = useState([]);

  // fetches user's workouts, sets state var "workouts" if successful response
  useEffect(() => {
    if (cookies.userId) {
      getWorkoutsByUserId(cookies.userId).then((res) => {
        if (res.type === "success" && res.data) {
          setWorkouts(res.data);
        } else if (res.type === "success") {
          console.warn(
            `getWorkoutsByUserId: no workouts for user with id = ${cookies.userId}`
          );
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  const renderWorkouts = () => {
    const newDates = [];
    const groupedWorkouts = {};

    workouts.forEach((w) => {
      const currentDate = w.date.split("T")[0];

      // groups workouts by date
      if (!newDates.includes(currentDate)) {
        newDates.push(currentDate);
        groupedWorkouts[currentDate] = {};
      }

      // groups exercises by muscle group
      const currentMuscle = w.muscle_group;
      if (!groupedWorkouts[currentDate][currentMuscle]) {
        groupedWorkouts[currentDate][currentMuscle] = [];
      }
      groupedWorkouts[currentDate][currentMuscle].push({
        id: w.id,
        date: w.date,
        exercise_id: w.exercise_id,
        weight: w.weight,
        reps: w.reps,
        user_id: w.user_id,
        name: w.name,
        muscle_group: w.muscle_group,
      });
    });

    return Object.entries(groupedWorkouts).map((entry) => (
      <Workout
        key={entry[1].id}
        date={entry[0]}
        workout={entry[1]}
        handleEditOpen={handleEditOpen}
      />
    ));
  };

  const handleEditOpen = (date, workouts, newEditStatus) => {
    setSelectedDate(date);
    setWorkoutsEditing(workouts);
    setEditing(newEditStatus);
  };

  const handleEditClose = (e) => {
    e.preventDefault();

    setEditing(false);
    setSelectedDate(null);
    setWorkoutsEditing([]);
  };

  return (
    <div className="workouts">
      <div className="top">
        <div className="left">
          <h5>Workouts</h5>
        </div>
        <div className="right">{/* add date select here */}</div>
      </div>
      <div className="workouts-container">{renderWorkouts()}</div>
      <Modal open={editing} onClose={handleEditClose}>
        <EditWorkout
          date={selectedDate}
          workouts={workoutsEditing}
          handleEditClose={handleEditClose}
        />
      </Modal>
    </div>
  );
}

export default Workouts;
