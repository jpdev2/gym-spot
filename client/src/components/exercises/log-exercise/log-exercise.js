import { useState } from "react";
import { OutlinedInput, TextField } from "@mui/material";
import { DatePicker } from "@mui/lab";
import "./log-exercise.scss";

function LogExercise({ exercise, logExercise, setShowAdd }) {
  const [dateExercised, setDateExercised] = useState(new Date());
  const [weight, setWeight] = useState();
  const [reps, setReps] = useState();

  return (
    <form className="log-exercise">
      <h5>
        {exercise.muscle_group}: {exercise.name}
      </h5>
      <div className="form-container">
        <div className="headers">
          <p>reps</p>
          <p>weight</p>
          <p>date</p>
        </div>
        <div className="inputs">
          <OutlinedInput
            placeholder="reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
          <OutlinedInput
            placeholder="pounds"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <DatePicker
            views={["day", "month", "year"]}
            value={dateExercised}
            onChange={(newDate) => {
              setDateExercised(newDate);
            }}
            renderInput={(params) => (
              <TextField {...params} helperText={null} />
            )}
            fullWidth
          />
        </div>
      </div>

      <div className="button-container">
        <button onClick={(e) => setShowAdd(false)} className="cancel-button">
          cancel
        </button>
        <button
          onClick={(e) => logExercise(e, dateExercised, weight, reps)}
          className="log-button"
        >
          log exercise
        </button>
      </div>
    </form>
  );
}

export default LogExercise;
