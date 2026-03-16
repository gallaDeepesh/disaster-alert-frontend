import axios from "axios"

const api = axios.create({
baseURL:"http://localhost:8080"
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn("API Request made without a valid JWT in LocalStorage");
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api