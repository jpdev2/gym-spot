import { getCookie } from "../util/cookies";

export const postExercise = async (name, muscle_group, user_id) => {
  const options = {
    method: "POST",
    headers: {
      authorization: getCookie("jwt"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      muscle_group,
      user_id,
    }),
  };

  const response = await fetch("/exercises", options);
  return await response.json();
};

export const getExercisesByUserId = async (userId) => {
  const options = {
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const response = await fetch(`/exercises/${userId}`, options);
  return await response.json();
};

export const deleteExerciseById = async (userId, exerciseId) => {
  const options = {
    method: "DELETE",
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const response = await fetch(
    `/exercises?user_id=${userId}&exercise_id=${exerciseId}`,
    options
  );
  return await response.json();
};
