import axios from 'axios';

const API_URL = '/api'; // Proxied via Nginx

const api = axios.create({
    baseURL: API_URL,
});

export const getNotes = () => api.get('/notes');
export const createNote = (note) => api.post('/notes', note);
export const updateNote = (id, note) => api.put(`/notes/${id}`, note);
export const deleteNote = (id) => api.delete(`/notes/${id}`);

export default api;
