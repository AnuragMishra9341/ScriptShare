import axios from "axios";

const privateApi = axios.create({
  baseURL: import.meta.env.BASE_URL,
  withCredentials: true, // send cookies automatically
});

// Response interceptor for 401
privateApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = "/login"; // redirect if unauthorized
    }
    return Promise.reject(error);
  }
);

export default privateApi;
