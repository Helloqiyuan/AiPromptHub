import axios from 'axios';
import http from './http';

export const api = {
  health: () => axios.get('/health').then((res) => res.data),

  register: (payload) => http.post('/users/register', payload),
  login: (payload) => http.post('/users/login', payload),
  me: () => http.get('/users/me'),
  updateMe: (payload) => http.put('/users/me', payload),
  myPrompts: (params) => http.get('/users/me/prompts', { params }),
  myFavorites: (params) => http.get('/users/me/favorites', { params }),
  myComments: (params) => http.get('/users/me/comments', { params }),

  listPrompts: (params) => http.get('/prompts', { params }),
  promptDetail: (id) => http.get(`/prompts/${id}`),
  createPrompt: (payload) => http.post('/prompts', payload),
  updatePrompt: (id, payload) => http.put(`/prompts/${id}`, payload),
  deletePrompt: (id) => http.delete(`/prompts/${id}`),
  toggleFavorite: (id) => http.post(`/prompts/${id}/favorites/toggle`),
  toggleLike: (id) => http.post(`/prompts/${id}/likes/toggle`),

  createComment: (payload) => http.post('/comments', payload),
  commentTree: (promptId) => http.get('/comments/tree', { params: { promptId } }),
  deleteComment: (id) => http.delete(`/comments/${id}`),

  categories: () => http.get('/catalog/categories'),
  tags: () => http.get('/catalog/tags'),
  createCategory: (payload) => http.post('/catalog/categories', payload),

  adminStats: () => http.get('/admin/stats'),
  adminPrompts: (params) => http.get('/admin/prompts', { params }),
  reviewPrompt: (id, status) => http.patch(`/admin/prompts/${id}/status`, { status }),
  adminDeletePrompt: (id) => http.delete(`/admin/prompts/${id}`),
  adminUsers: (params) => http.get('/admin/users', { params }),
  updateUserRole: (id, role) => http.patch(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, status) => http.patch(`/admin/users/${id}/status`, { status }),
};
