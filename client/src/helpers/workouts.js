import { getCookie } from "../util/cookies";

export const postWorkout = async (exercise, date, weight, reps) => {
  const { user_id } = exercise;
  const exercise_id = exercise.id;

  const options = {
    method: "POST",
    headers: {
      authorization: getCookie("jwt"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date,
      exercise_id,
      weight,
      reps,
      user_id,
    }),
  };

  const response = await fetch("/workouts", options);
  return await response.json();
};

export const getWorkoutsByUserId = async (userId) => {
  const options = {
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const reponse = await fetch(`/workouts/${userId}`, options);
  return await reponse.json();
};

export const editWorkouts = async (logs) => {
  const options = {
    method: "PATCH",
    headers: {
      authorization: getCookie("jwt"),
      "content-type": "application/json",
    },
    body: JSON.stringify(logs),
  };

  const response = await fetch("/workouts/batch", options);
  return await response.json();
};
