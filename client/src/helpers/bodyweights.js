import { getCookie } from "../util/cookies";

export const postBodyWeight = async (weight, date, userId) => {
  const options = {
    method: "POST",
    headers: {
      authorization: getCookie("jwt"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      weight,
      date,
      user_id: parseInt(userId),
    }),
  };

  const response = await fetch("/bodyweights", options);
  return await response.json();
};

export const getBodyWeightsById = async (userId) => {
  const options = {
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const response = await fetch(`/bodyweights/${userId}`, options);
  return await response.json();
};
