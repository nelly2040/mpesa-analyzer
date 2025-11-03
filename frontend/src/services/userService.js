import API from './api';

const updateProfile = async (userData) => {
    const response = await API.put('/users/profile', userData);
    // Update local storage with the new user info (including the new token)
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const changePassword = async (passwordData) => {
    const response = await API.put('/users/password', passwordData);
    return response.data;
};

const userService = {
    updateProfile,
    changePassword,
};

export default userService;