import axios from "axios";

// One Axios instance for the whole app. Every request goes through here,
// so the auth token and error handling only have to be written once.
const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 15000,
});

// Attach the login token to every outgoing request, if we have one.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors in one place. We normalise whatever DummyJSON sends back
// into a plain { message, status } shape so components never have to dig
// into error.response.data.message themselves.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A cancelled request (from an AbortController) is not a real error,
    // it just means a newer request superseded this one. Let callers see
    // that it was a cancellation so they can silently ignore it.
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject({ cancelled: true });
    }

    const status = error.response?.status;
    let message = "Something went wrong. Please try again.";

    if (error.code === "ECONNABORTED") {
      message = "The request took too long. Please try again.";
    } else if (!error.response) {
      message = "Can't reach the server. Check your connection and try again.";
    } else if (status === 400) {
      message = error.response.data?.message || "That request wasn't valid.";
    } else if (status === 401) {
      message = "Your session has expired. Please log in again.";
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    } else if (status === 404) {
      message = "We couldn't find that.";
    } else if (status >= 500) {
      message = "The server had a problem on its end.";
    } else {
      message = error.response.data?.message || message;
    }

    return Promise.reject({ status, message, original: error });
  }
);

export default api;
