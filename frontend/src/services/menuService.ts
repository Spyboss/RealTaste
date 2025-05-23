import { api, handleApiResponse } from './api';
import { Category, MenuItem } from '../types/shared';

export const menuService = {
  // Get full menu with categories and items
  getMenu: async (): Promise<Category[]> => {
    const response = await api.get('/menu');
    return handleApiResponse(response);
  },

  // Get specific menu item
  getMenuItem: async (id: string): Promise<MenuItem> => {
    const response = await api.get(`/menu/items/${id}`);
    return handleApiResponse(response);
  },

  // Admin: Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/menu/categories');
    return handleApiResponse(response);
  },

  // Admin: Create category
  createCategory: async (category: Partial<Category>): Promise<Category> => {
    const response = await api.post('/menu/categories', category);
    return handleApiResponse(response);
  },

  // Admin: Create menu item
  createMenuItem: async (item: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.post('/menu/items', item);
    return handleApiResponse(response);
  },

  // Admin: Update menu item
  updateMenuItem: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.patch(`/menu/items/${id}`, updates);
    return handleApiResponse(response);
  },
};
