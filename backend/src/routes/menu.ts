import { Router } from 'express';
import { supabaseAdmin, tables } from '../services/supabase';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { adminLimiter } from '../middleware/rateLimiter';
import { ApiResponse, MenuItem, Category } from '../types/shared';

const router = Router();

// GET /api/menu - Get full menu with categories, items, variants, and addons
router.get('/', async (req, res) => {
  try {
    // Get categories with their menu items
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from(tables.categories)
      .select(`
        *,
        menu_items (
          *,
          menu_variants (*),
          menu_addons (*)
        )
      `)
      .eq('is_active', true)
      .order('sort_order');

    if (categoriesError) throw categoriesError;

    // Filter out unavailable items and sort them
    const menuData = categories?.map(category => ({
      ...category,
      menu_items: category.menu_items
        ?.filter((item: any) => item.is_available)
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        ?.map((item: any) => ({
          ...item,
          variants: item.menu_variants
            ?.filter((variant: any) => variant.is_available)
            ?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [],
          addons: item.menu_addons
            ?.filter((addon: any) => addon.is_available)
            ?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
        }))
    }));

    const response: ApiResponse<Category[]> = {
      success: true,
      data: menuData || []
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu'
    });
  }
});

// GET /api/menu/categories - Get all categories (admin only)
router.get('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(tables.categories)
      .select('*')
      .order('sort_order');

    if (error) throw error;

    const response: ApiResponse<Category[]> = {
      success: true,
      data: data || []
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// POST /api/menu/categories - Create new category (admin only)
router.post('/categories',
  authenticateToken,
  requireAdmin,
  adminLimiter,
  validate(schemas.createCategory),
  async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from(tables.categories)
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;

      const response: ApiResponse<Category> = {
        success: true,
        data,
        message: 'Category created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create category'
      });
    }
  }
);

// GET /api/menu/items/:id - Get specific menu item with variants and addons
router.get('/items/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(tables.menu_items)
      .select(`
        *,
        category:categories(*),
        menu_variants(*),
        menu_addons(*)
      `)
      .eq('id', req.params.id)
      .eq('is_available', true)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Format the response
    const menuItem = {
      ...data,
      variants: data.menu_variants
        ?.filter((variant: any) => variant.is_available)
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [],
      addons: data.menu_addons
        ?.filter((addon: any) => addon.is_available)
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
    };

    const response: ApiResponse<MenuItem> = {
      success: true,
      data: menuItem
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu item'
    });
  }
});

// POST /api/menu/items - Create new menu item (admin only)
router.post('/items',
  authenticateToken,
  requireAdmin,
  adminLimiter,
  validate(schemas.createMenuItem),
  async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from(tables.menu_items)
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;

      const response: ApiResponse<MenuItem> = {
        success: true,
        data,
        message: 'Menu item created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create menu item'
      });
    }
  }
);

// PATCH /api/menu/items/:id - Update menu item (admin only)
router.patch('/items/:id',
  authenticateToken,
  requireAdmin,
  adminLimiter,
  async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from(tables.menu_items)
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;

      const response: ApiResponse<MenuItem> = {
        success: true,
        data,
        message: 'Menu item updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update menu item'
      });
    }
  }
);

export default router;
