import api from './axios';

export const getMessages = (conversationId, cursor = '', limit = 20) => 
  api.get(`/conversations/${conversationId}/messages?cursor=${cursor}&limit=${limit}`);

export const sendMessage = (conversationId, data) => 
  api.post(`/conversations/${conversationId}/messages`, data);

export const searchMessages = (conversationId, query) => 
  api.get(`/conversations/${conversationId}/search?q=${query}`);