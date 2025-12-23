import axios from "axios";

// Create an axio instance with default config
const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
