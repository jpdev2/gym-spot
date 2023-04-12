import { OutlinedInput } from "@mui/material";
import "./edit-workout-row.scss";

function EditWorkoutRow({ workout, setEditedWorkouts }) {
  const handleWorkoutChange = (e, id, newReps, newWeight) => {
    e.preventDefault();
    setEditedWorkouts((prevEditedWorkouts) => {
      return prevEditedWorkouts.map((w) => {
        if (w.id === id) {
          return {
            ...w,
            reps: newReps,
            weight: newWeight,
          };
        }
        return w;
      });
    });
  };

  const isDeleted = workout.reps === 0 && workout.weight === 0;

  return (
    <div className="edit-workout-row">
      <p>{workout.name}</p>
      <OutlinedInput
        value={workout.reps}
        onChange={(e) =>
          handleWorkoutChange(e, workout.id, e.target.value, workout.weight)
        }
      />
      <OutlinedInput
        value={workout.weight}
        onChange={(e) =>
          handleWorkoutChange(e, workout.id, workout.reps, e.target.value)
        }
      />
      <button
        // className={
        //   isDeleted ? "delete-button delete-button-disabled" : "delete-button"
        // }
        // disabled={isDeleted}
        onClick={(e) => handleWorkoutChange(e, workout.id, "0", "0")}
      >
        x
      </button>
    </div>
  );
}

export default EditWorkoutRow;
