import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Modal } from "@mui/material";
import Exercise from "./exercise/exercise";
import AddExercise from "./add-exercise/add-exercise";
import LogExercise from "./log-exercise/log-exercise";
import {
  deleteExerciseById,
  getExercisesByUserId,
} from "../../helpers/exercises";
import { postWorkout } from "../../helpers/workouts";
import "./exercises.scss";

const Exercises = () => {
  const [cookies, setCookies] = useCookies(["user"]);
  const [exercises, setExercises] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [exerciseToLog, setExerciseToLog] = useState();

  // fetches user's exercises, sets state var "exercises" if successful response
  useEffect(() => {
    if (cookies.userId) {
      getExercisesByUserId(cookies.userId).then((res) => {
        if (res.type === "success" && res.data) {
          setExercises(res.data);
        } else if (res.type === "success") {
          console.warn(
            `getExercisesByUserId: no exercises for user with id = ${cookies.userId}`
          );
        } else {
          console.error(res);
        }
      });
    }
  }, []);

  // groups exercises by muscle group, then renders each exercise
  const renderExercises = () => {
    if (!exercises.length) return;

    const muscleGroups = [];
    const groupedExercises = {};

    exercises.forEach((e) => {
      if (!muscleGroups.includes(e.muscle_group)) {
        muscleGroups.push(e.muscle_group);
        groupedExercises[e.muscle_group] = [];
      }
      groupedExercises[e.muscle_group].push(e.name);
    });

    const items = Object.entries(groupedExercises);

    // TODO: make modal for deleteExercise

    return items.map((i) => {
      return (
        <div className="section" key={i[0]}>
          <h6>{i[0]}</h6>
          <div className="exercise-container">
            {i[1].map((e) => (
              <Exercise
                name={e}
                handleLog={handleLogClick}
                handleDelete={deleteExercise}
                key={e}
              />
            ))}
          </div>
        </div>
      );
    });
  };

  const deleteExercise = async (e, exerciseName) => {
    e.preventDefault();

    const exerciseToDelete = exercises.find(
      (exercise) => exercise.name === exerciseName
    );

    deleteExerciseById(cookies.userId, exerciseToDelete.id).then((res) => {
      if (res.type === "success") {
        alert(
          `Exercise with id = ${exerciseToDelete.id} successfully deleted.`
        );
        window.location.reload();
      } else {
        console.error(res);
      }
    });
  };

  const handleLogClick = (e, exerciseName) => {
    e.preventDefault();

    const exerciseToLog = exercises.find(
      (exercise) => exercise.name === exerciseName
    );

    setExerciseToLog(exerciseToLog);
    setShowAdd(true);
  };

  const logExercise = async (e, dateExercised, weight, reps) => {
    e.preventDefault();

    const dMonth = dateExercised.getMonth() + 1;
    const dDate = dateExercised.getDate();
    const dYear = dateExercised.getFullYear();

    const dateStr = `${dMonth >= 10 ? dMonth : `0${dMonth}`}/${
      dDate >= 10 ? dDate : `0${dDate}`
    }/${dYear}`;

    postWorkout(exerciseToLog, dateStr, weight, reps).then((res) => {
      if (res.type === "success") {
        alert(`Exercise logged successfully!`);
        window.location.reload();
      } else {
        console.error(res);
      }
    });
  };

  return (
    <div className="exercises">
      <div className="top">
        <h5>Exercises</h5>
        <AddExercise />
      </div>
      <div className="headers">
        <p>Muscle/Exercise</p>
        <p className="centered">Log</p>
        <p className="centered">Delete</p>
      </div>
      <div className="content">{renderExercises()}</div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <LogExercise
          exercise={exerciseToLog}
          logExercise={logExercise}
          setShowAdd={setShowAdd}
        />
      </Modal>
    </div>
  );
};

export default Exercises;
