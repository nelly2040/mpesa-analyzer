import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext'; // We'll update this import path in the next step
import userService from '../services/userService';

const SettingsPage = () => {
    const { user, setUser } = useAuth();
    
    // STEP 1: All hooks are now at the top level, unconditionally.
    const [name, setName] = useState(user ? user.name : '');
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // STEP 2: The conditional return happens AFTER all hooks are called.
    if (!user) {
        return <div>Loading user profile...</div>;
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await userService.updateProfile({ name });
            setUser(updatedUser);
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) { // Keep err to see potential logs
            console.error(err);
            setProfileMessage({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            await userService.changePassword({ currentPassword, newPassword });
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) { // Keep err to see potential logs
            console.error(err);
            setPasswordMessage({ type: 'error', text: 'Failed to change password. Check your current password.' });
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Update Profile Form */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email (cannot be changed)</label>
                                <input type="email" value={user.email} disabled className="w-full mt-1 p-2 border rounded bg-gray-100 cursor-not-allowed"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded"/>
                            </div>
                            <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">Update Profile</button>
                            {profileMessage.text && (
                                <p className={`text-sm ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{profileMessage.text}</p>
                            )}
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full mt-1 p-2 border rounded"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full mt-1 p-2 border rounded"/>
                            </div>
                            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Change Password</button>
                             {passwordMessage.text && (
                                <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage.text}</p>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;