import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
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