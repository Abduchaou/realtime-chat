import api from './axios';

export const getConversations = () => api.get('/conversations');
export const createConversation = (data) => api.post('/conversations', data);
export const joinConversation = (id) => api.post(`/conversations/${id}/join`);
export const getMembers = (id) => api.get(`/conversations/${id}/members`);