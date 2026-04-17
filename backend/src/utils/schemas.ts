import Joi from 'joi';

export const schemas = {
  // Auth schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    age: Joi.number().optional(),
    phone: Joi.string().max(10).optional(),
  }),

  // Ticket schemas
  createTicket: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().optional(),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .default('medium'),
    status: Joi.string()
      .valid('todo', 'in_progress', 'in_review', 'done')
      .default('todo'),
    assignedToId: Joi.string().allow(null, '').optional(),
    dueDate: Joi.date().allow(null).optional(),
    startDate: Joi.date().allow(null).optional(),
    endDate: Joi.date().allow(null).optional(),
    groupId: Joi.string().required(),
  }),

  updateTicket: Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().optional(),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .optional(),
    status: Joi.string()
      .valid('todo', 'in_progress', 'in_review', 'done')
      .optional(),
    assignedToId: Joi.string().allow(null, '').optional(),
    dueDate: Joi.date().allow(null).optional(),
    startDate: Joi.date().allow(null).optional(),
    endDate: Joi.date().allow(null).optional(),
  }),

  // Group schemas
  createGroup: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow('').optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    icon: Joi.string().allow('').optional(),
  }),

  updateGroup: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    description: Joi.string().allow('').optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    icon: Joi.string().allow('').optional(),
  }),

  // User permission schemas
  assignPermissions: Joi.object({
    userId: Joi.string().required(),
    groupId: Joi.string().required(),
    permissions: Joi.array()
      .items(Joi.string())
      .required(),
  }),
};

export function validateSchema(schema: Joi.Schema, data: any) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  return { error, value };
}
