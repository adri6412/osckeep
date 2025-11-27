import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb } from 'react-icons/fa';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-keep-bg text-keep-text">
            <div className="bg-keep-card p-8 rounded-2xl shadow-2xl w-full max-w-md border border-keep-border">
                <div className="flex justify-center mb-6">
                    <div className="bg-yellow-500 p-3 rounded-full">
                        <FaLightbulb className="text-keep-bg text-3xl" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">Sign in to OscKeep</h2>

                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-keep-muted mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-keep-bg border border-keep-border rounded-lg px-4 py-2 text-keep-text focus:outline-none focus:border-yellow-500 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-keep-muted mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-keep-bg border border-keep-border rounded-lg px-4 py-2 text-keep-text focus:outline-none focus:border-yellow-500 transition-colors"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
