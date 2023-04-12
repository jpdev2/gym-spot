import { useState } from "react";
import EditWorkoutRow from "./edit-workout-row/edit-workout-row";
import { editWorkouts } from "../../../helpers/workouts";
import "./edit-workout.scss";

function EditWorkout({ date, workouts, handleEditClose }) {
  const [editedWorkouts, setEditedWorkouts] = useState(
    Object.values(workouts).flat()
  );

  const renderWorkouts = () => {
    return editedWorkouts.map((w) => (
      <EditWorkoutRow
        workout={w}
        editedWorkouts={editedWorkouts}
        setEditedWorkouts={setEditedWorkouts}
      />
    ));
  };

  const saveChanges = (e) => {
    e.preventDefault();

    // finds workouts that have been edited (reps change, weight change, or delete)
    const originalWorkouts = Object.values(workouts).flat();

    const changes = editedWorkouts.filter((w) => !originalWorkouts.includes(w));
    editWorkouts(changes).then((res) => {
      if (res.type === "success") {
        alert("Workouts successfully edited!");
        window.location.reload();
      } else {
        console.error(res);
      }
    });
  };

  return (
    <div className="edit-workouts">
      <h5>Edit Workout ({date})</h5>
      <div className="headers">
        <p>Exercise</p>
        <p>Reps</p>
        <p>Weight</p>
        <p className="delete-header">Delete</p>
      </div>
      <div className="workouts-content">{renderWorkouts()}</div>
      <div className="buttons">
        <button onClick={handleEditClose} className="cancel-button">
          Cancel
        </button>
        <button onClick={saveChanges} className="save-button">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default EditWorkout;
