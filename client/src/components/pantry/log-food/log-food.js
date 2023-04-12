import { useState } from "react";
import { OutlinedInput, TextField } from "@mui/material";
import { DatePicker } from "@mui/lab";
import "./log-food.scss";
import "./log_food_mobile.scss";

function LogFood({ food, logFood, setShowAdd }) {
  const [consumedSize, setConsumedSize] = useState("");
  const [dateConsumed, setDateConsumed] = useState(new Date());

  return (
    <form className="log-food">
      <h5>{food.name}</h5>
      <p>Serving size = {food.serving_weight} g</p>
      <div className="form-container">
        <div className="headers">
          <p>consumed amount</p>
          <p>date consumed</p>
        </div>
        <div className="inputs">
          <OutlinedInput
            className="amount"
            placeholder="grams"
            value={consumedSize}
            onChange={(e) => setConsumedSize(e.target.value)}
          />
          <DatePicker
            views={["day", "month", "year"]}
            value={dateConsumed}
            onChange={(newDate) => {
              setDateConsumed(newDate);
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
          onClick={(e) =>
            logFood(e, food, parseFloat(consumedSize), dateConsumed)
          }
          className="log-button"
        >
          log food
        </button>
      </div>
    </form>
  );
}

export default LogFood;
