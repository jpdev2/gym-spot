import { getCookie } from "../util/cookies";

export const signup = async (
  first_name,
  last_name,
  email,
  dob,
  gender,
  height_inches,
  weight_pounds,
  workout_frequency,
  diet_plan,
  password
) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name,
      last_name,
      email,
      dob,
      gender,
      height_inches,
      weight_pounds,
      workout_frequency,
      diet_plan,
      password,
    }),
  };

  const response = await fetch("/users", options);
  return await response.json();
};

export const fetchProfile = async (id) => {
  const options = {
    headers: {
      authorization: getCookie("jwt"),
    },
  };

  const response = await fetch(`/users/${id}`, options);
  return await response.json();
};

export const patchUser = async (updatedUser) => {
  const options = {
    method: "PATCH",
    headers: {
      authorization: getCookie("jwt"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedUser),
  };

  const response = await fetch(`/users`, options);
  return await response.json();
};

export const updateAccount = async (
  email,
  new_email,
  password,
  new_password,
  id
) => {
  const options = {
    method: "PATCH",
    headers: {
      authorization: getCookie("jwt"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, new_email, password, new_password }),
  };

  const response = await fetch(`/users/update-account/${id}`, options);
  return await response.json();
};

export const editDietPlan = async (id, diet_plan) => {
  const options = {
    method: "PATCH",
    headers: {
      authorization: getCookie("jwt"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      diet_plan,
    }),
  };

  const response = await fetch(`/users`, options);
  return await response.json();
};
