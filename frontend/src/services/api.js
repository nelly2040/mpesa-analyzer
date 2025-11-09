import axios from 'axios';


// Use Render backend URL in production
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://mpesa-analyzer-backend.onrender.com/api'
  : 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

// Add response interceptor to handle errors better
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only logout on 401 Unauthorized, not on 404 or other errors
        if (error.response?.status === 401) {
            console.log('Authentication failed, logging out...');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;