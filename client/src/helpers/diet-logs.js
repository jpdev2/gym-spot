import { getCookie } from "../util/cookies";

export const postDietLog = async (food, consumed_weight, date) => {
  const factor = consumed_weight / food.serving_weight;
  const consumed_fat = food.fat * factor;
  const consumed_carbs = food.carbs * factor;
  const consumed_protein = food.protein * factor;
  const consumed_cal = food.cal * factor;

  const options = {
    method: "POST",
    headers: {
      authorization: getCookie("jwt"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date,
      consumed_weight,
      consumed_fat,
      consumed_carbs,
      consumed_protein,
      consumed_cal,
      user_id: parseInt(food.user_id),
      food_id: parseInt(food.id),
    }),
  };

  const response = await fetch("/dietlogs", options);
  return await response.json();
};

export const getDietLogsByDate = async (id, date) => {
  const options = {
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const response = await fetch(`/dietlogs?userid=${id}&date=${date}`, options);
  return await response.json();
};

export const getDietLogDates = async (id) => {
  const options = {
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const response = await fetch(`/dietlogs/dates/${id}`, options);
  return await response.json();
};

export const getDietLogSummaries = async (id) => {
  const options = {
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const response = await fetch(`/dietlogs/summaries/${id}`, options);
  return await response.json();
};

export const editDietLogs = async (logs) => {
  const options = {
    method: "PATCH",
    headers: {
      authorization: getCookie("jwt"),
      "content-type": "application/json",
    },
    body: JSON.stringify(logs),
  };

  const response = await fetch("/dietlogs/batch", options);
  return await response.json();
};
