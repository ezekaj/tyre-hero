import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from './errorHandler.js';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationResults: string[] = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        validationResults.push(`Body: ${error.details.map(x => x.message).join(', ')}`);
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        validationResults.push(`Query: ${error.details.map(x => x.message).join(', ')}`);
      }
    }

    // Validate route parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        validationResults.push(`Params: ${error.details.map(x => x.message).join(', ')}`);
      }
    }

    if (validationResults.length > 0) {
      return next(new ApiError(`Validation Error: ${validationResults.join('; ')}`, 400));
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  // User validation schemas
  userRegister: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phoneNumber: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional(),
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  userUpdate: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phoneNumber: Joi.string().pattern(new RegExp('^\\+?[1-9]\\d{1,14}$')).optional().allow(null),
  }),

  // Booking validation schemas
  bookingCreate: Joi.object({
    serviceId: Joi.string().required(),
    addressId: Joi.string().required(),
    scheduledDateTime: Joi.date().min('now').required(),
    vehicleMake: Joi.string().required(),
    vehicleModel: Joi.string().required(),
    vehicleYear: Joi.number().min(1980).max(new Date().getFullYear() + 1).required(),
    vehicleColor: Joi.string().optional(),
    licensePlate: Joi.string().optional(),
    damageDescription: Joi.string().max(1000).optional(),
    specialInstructions: Joi.string().max(500).optional(),
    addOns: Joi.array().items(Joi.object({
      serviceAddOnId: Joi.string().required(),
      quantity: Joi.number().min(1).default(1),
    })).optional(),
  }),

  bookingUpdate: Joi.object({
    scheduledDateTime: Joi.date().min('now').optional(),
    vehicleMake: Joi.string().optional(),
    vehicleModel: Joi.string().optional(),
    vehicleYear: Joi.number().min(1980).max(new Date().getFullYear() + 1).optional(),
    vehicleColor: Joi.string().optional(),
    licensePlate: Joi.string().optional(),
    damageDescription: Joi.string().max(1000).optional(),
    specialInstructions: Joi.string().max(500).optional(),
  }),

  // Address validation schemas
  addressCreate: Joi.object({
    label: Joi.string().max(50).required(),
    addressLine1: Joi.string().max(200).required(),
    addressLine2: Joi.string().max(200).optional(),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    postalCode: Joi.string().max(20).required(),
    country: Joi.string().max(100).default('UAE'),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    isDefault: Joi.boolean().default(false),
  }),

  // Review validation schemas
  reviewCreate: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000).optional(),
    serviceRating: Joi.number().min(1).max(5).optional(),
    timelinessRating: Joi.number().min(1).max(5).optional(),
    professionalismRating: Joi.number().min(1).max(5).optional(),
  }),

  // Common parameter schemas
  idParam: Joi.object({
    id: Joi.string().required(),
  }),

  // Pagination schemas
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Password reset schemas
  passwordReset: Joi.object({
    email: Joi.string().email().required(),
  }),

  passwordResetConfirm: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
  }),
};