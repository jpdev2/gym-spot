export const postFitbitData = async (file, userId) => {
  const formData = new FormData();
  formData.append("file", file);

  const options = {
    method: "POST",
    body: formData,
  };

  const response = await fetch(
    `http://localhost:105/data-svc/fitbit?user_id=${userId}`,
    options
  );
  return await response.json();
};

export const getUserData = async (start, end, userId) => {
  const response = await fetch(
    `http://localhost:105/data-svc/user-data?start=${start}&end=${end}&user_id=${userId}`
  );
  return await response.json();
};

export const getDataBounds = async (userId) => {
  const response = await fetch(
    `http://localhost:105/data-svc/bounds?user_id=${userId}`
  );
  return await response.json();
};
