import { useState } from "react";
import { useCookies } from "react-cookie";
import { Modal, OutlinedInput } from "@mui/material";
import { postExercise } from "../../../helpers/exercises";
import "./add-exercise.scss";

function AddExercise() {
  const [cookies, setCookies] = useCookies(["user"]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");

  const cancelAdd = (e) => {
    e.preventDefault();
    setShowAdd(false);
  };

  const addExercise = (e) => {
    e.preventDefault();

    postExercise(name, muscle, parseInt(cookies.userId)).then((res) => {
      if (res.type === "success") {
        alert("New exercise successfully added!");
        window.location.reload();
      } else {
        console.error(res);
      }
    });
  };

  return (
    <div className="add-exercise-container">
      <button onClick={() => setShowAdd(true)} className="toggle-button">
        New Exercise
      </button>
      <Modal open={showAdd} onClose={cancelAdd}>
        <form className="add-exercise">
          <h5>New Exercise</h5>
          <div className="form-container">
            <div className="headers">
              <p>Name</p>
              <p>Muscle Group</p>
            </div>
            <div className="inputs">
              <OutlinedInput
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <OutlinedInput
                placeholder="muscle group"
                value={muscle}
                onChange={(e) => setMuscle(e.target.value)}
              />
            </div>
          </div>

          <div className="buttons">
            <button onClick={() => cancelAdd()} className="cancel-button">
              cancel
            </button>
            <button onClick={(e) => addExercise(e)} className="add-button">
              add exercise
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AddExercise;
