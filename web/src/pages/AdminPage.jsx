import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users');
            setUsers(res.data.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/users', newUser);
            setNewUser({ username: '', password: '', role: 'user' });
            fetchUsers();
        } catch (error) {
            console.error("Error creating user", error);
            alert("Failed to create user");
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/api/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-keep-bg text-keep-text p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-8">
                    <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-keep-hover rounded-full">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                </div>

                {/* Create User Form */}
                <div className="bg-keep-card p-6 rounded-xl border border-keep-border mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaUserPlus /> Create New User</h2>
                    <form onSubmit={handleCreateUser} className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="flex-1 bg-keep-bg border border-keep-border rounded px-3 py-2 text-keep-text"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="flex-1 bg-keep-bg border border-keep-border rounded px-3 py-2 text-keep-text"
                            required
                        />
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="bg-keep-bg border border-keep-border rounded px-3 py-2 text-keep-text"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-medium">
                            Create
                        </button>
                    </form>
                </div>

                {/* Users List */}
                <div className="bg-keep-card rounded-xl border border-keep-border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-keep-sidebar">
                            <tr>
                                <th className="p-4 font-semibold">ID</th>
                                <th className="p-4 font-semibold">Username</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Created At</th>
                                <th className="p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-t border-keep-border hover:bg-keep-hover">
                                    <td className="p-4">{user.id}</td>
                                    <td className="p-4 font-medium">{user.username}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'}`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-keep-muted text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded"
                                            disabled={user.username === 'admin'} // Prevent deleting default admin
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
