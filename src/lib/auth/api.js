import axios from "axios";

export const authApi = {
  login: async (credentials) => {
    let request;
    if (credentials.provider === "google") {
      request = { idToken: credentials.credential, provider: "google" };
    } else {
      request = {
        email: credentials.email,
        password: credentials.password,
        provider: "local",
      };
    }

    const { data, status } = await axios.post("/api/auth", request);
    return { data, status };
  },

  checkEmail: async (email) => {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check-email", email }),
    });

    return await response.json();
  },

  signUp: async (formData) => {
    const requestData = {
      action: "signup",
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    };

    const response = await axios.post("/api/auth", requestData);
    return response;
  },
};