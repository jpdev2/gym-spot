export const login = async (email, password) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  };

  const response = await fetch("/auth/login", options);
  if (!response.ok) {
    return {
      type: "error",
      error: `${response.status}: ${response.statusText}`,
    };
  }

  return await response.json();
};

export const logout = async (jwt) => {
  const options = {
    method: "POST",
    headers: {
      authorization: jwt,
    },
  };

  const response = await fetch("/auth/logout", options);
  return await response.json();
};
