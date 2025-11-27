import axios from 'axios';

const API_URL = '/api'; // Proxied via Nginx

const api = axios.create({
    baseURL: API_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getNotes = (filter = 'all') => api.get('/notes', { params: { filter } });
export const createNote = (note) => api.post('/notes', note);
export const updateNote = (id, note) => api.put(`/notes/${id}`, note);
export const deleteNote = (id) => api.delete(`/notes/${id}`); // Permanent delete from trash
export const archiveNote = (id) => api.put(`/notes/${id}/archive`);
export const unarchiveNote = (id) => api.put(`/notes/${id}/unarchive`);
export const moveToTrash = (id) => api.put(`/notes/${id}/delete`);
export const restoreNote = (id) => api.put(`/notes/${id}/restore`);

export default api;
