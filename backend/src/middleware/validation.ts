import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Update request body with validated and cleaned data
    req.body = value;
    next();
  };
};

// Validation schemas
export const schemas = {
  createOrder: Joi.object({
    customer_phone: Joi.string()
      .custom((value, helpers) => {
        // Remove spaces and validate
        const cleanPhone = value.replace(/\s+/g, '');
        if (!/^(\+94|0)[0-9]{8,9}$/.test(cleanPhone)) {
          return helpers.error('string.pattern.base');
        }
        return cleanPhone;
      })
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid Sri Lankan phone number (format: +94xxxxxxxxx or 0xxxxxxxxx)'
      }),
    customer_name: Joi.string().min(1).max(100).optional(),
    payment_method: Joi.string().valid('card', 'cash').required(),
    order_type: Joi.string().valid('pickup', 'delivery').default('pickup'),
    delivery_address: Joi.string().max(500).when('order_type', {
      is: 'delivery',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    delivery_latitude: Joi.number().optional(),
    delivery_longitude: Joi.number().optional(),
    delivery_notes: Joi.string().max(500).optional(),
    customer_gps_location: Joi.string().max(200).optional(),
    notes: Joi.string().max(500).optional(),
    items: Joi.array().items(
      Joi.object({
        menu_item_id: Joi.string().uuid().required(),
        variant_id: Joi.string().uuid().allow(null).optional(),
        quantity: Joi.number().integer().min(1).max(10).required(),
        notes: Joi.string().max(200).optional(),
        addon_ids: Joi.array().items(Joi.string().uuid()).optional()
      })
    ).min(1).required()
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string()
      .valid('received', 'preparing', 'ready_for_pickup', 'picked_up', 'cancelled')
      .required(),
    estimated_pickup_time: Joi.string().isoDate().optional()
  }),

  createMenuItem: Joi.object({
    category_id: Joi.string().uuid().required(),
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    base_price: Joi.number().positive().required(),
    image_url: Joi.string().uri().optional(),
    is_available: Joi.boolean().default(true),
    sort_order: Joi.number().integer().min(0).default(0)
  }),

  createCategory: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(200).optional(),
    sort_order: Joi.number().integer().min(0).default(0),
    is_active: Joi.boolean().default(true)
  }),

  createVariant: Joi.object({
    menu_item_id: Joi.string().uuid().required(),
    name: Joi.string().min(1).max(50).required(),
    price_modifier: Joi.number().required(),
    is_available: Joi.boolean().default(true),
    sort_order: Joi.number().integer().min(0).default(0)
  }),

  createAddon: Joi.object({
    menu_item_id: Joi.string().uuid().required(),
    name: Joi.string().min(1).max(50).required(),
    price: Joi.number().min(0).required(),
    is_available: Joi.boolean().default(true),
    sort_order: Joi.number().integer().min(0).default(0)
  })
};

// Query parameter validation
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    next();
  };
};

export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  orderFilters: Joi.object({
    status: Joi.string()
      .valid('received', 'preparing', 'ready_for_pickup', 'picked_up', 'cancelled')
      .optional(),
    date_from: Joi.string().isoDate().optional(),
    date_to: Joi.string().isoDate().optional(),
    customer_phone: Joi.string().optional()
  })
};
