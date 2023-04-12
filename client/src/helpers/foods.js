import { getCookie } from "../util/cookies";

export const postFood = async (
  name,
  serving_weight,
  fat,
  carbs,
  protein,
  cal,
  user_id
) => {
  const options = {
    method: "POST",
    headers: {
      authorization: getCookie("jwt"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      serving_weight,
      fat,
      carbs,
      protein,
      cal,
      user_id,
    }),
  };

  const response = await fetch("/foods", options);
  return await response.json();
};

export const fetchFoodsByUserId = async (userId) => {
  const options = {
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const response = await fetch(`/foods/${userId}`, options);
  return await response.json();
};

export const deleteFoodById = async (userId, foodId) => {
  const options = {
    method: "DELETE",
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const response = await fetch(
    `/foods?user_id=${userId}&food_id=${foodId}`,
    options
  );
  return await response.json();
};
