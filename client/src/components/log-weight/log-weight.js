import { useState } from "react";
import { useCookies } from "react-cookie";
import { Modal, OutlinedInput, TextField } from "@mui/material";
import { DatePicker } from "@mui/lab";
import { postBodyWeight } from "../../helpers/bodyweights";
import { dateToString } from "../../util/date-parse";
import "./log-weight.scss";

function LogWeight() {
  const [cookies, setCookies] = useCookies();
  const [show, setShow] = useState(false);
  const [weight, setWeight] = useState(0);
  const [date, setDate] = useState(new Date());

  const cancelLog = () => {
    setShow(false);
    setWeight(0);
    setDate(new Date());
  };

  const logWeight = () => {
    postBodyWeight(parseFloat(weight), dateToString(date), cookies.userId).then(
      (res) => {
        if (res.type === "success") {
          alert(`Bodyweight logged successfully!`);
          window.location.reload();
        } else {
          console.error(res);
        }
      }
    );
  };

  return (
    <div className="log-weight-container">
      <button onClick={() => setShow(true)}>Log Weight</button>
      <Modal open={show} onClose={cancelLog}>
        <div className="log-weight">
          <h5>Log Bodyweight</h5>
          <form>
            <div className="headers">
              <p>Weight</p>
              <p>Date</p>
            </div>
            <div className="inputs">
              <OutlinedInput
                placeholder="weight (lbs)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <DatePicker
                views={["day", "month", "year"]}
                value={date}
                onChange={(newDate) => {
                  setDate(newDate);
                }}
                renderInput={(params) => (
                  <TextField {...params} helperText={null} />
                )}
                fullWidth
              />
            </div>
          </form>

          <div className="buttons">
            <button onClick={cancelLog} className="cancel-button">
              Cancel
            </button>
            <button onClick={logWeight} className="add-button">
              Log Weight
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default LogWeight;
