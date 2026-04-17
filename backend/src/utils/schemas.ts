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
      .valid('Baja', 'Media', 'Alta')
      .default('Media'),
    status: Joi.string()
      .valid('Pendiente', 'En Progreso', 'Revisión', 'Hecho', 'Bloqueado')
      .default('Pendiente'),
    assignedToId: Joi.string().optional(),
    dueDate: Joi.date().optional(),
    groupId: Joi.string().required(),
  }),

  updateTicket: Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().optional(),
    priority: Joi.string()
      .valid('Baja', 'Media', 'Alta')
      .optional(),
    status: Joi.string()
      .valid('Pendiente', 'En Progreso', 'Revisión', 'Hecho', 'Bloqueado')
      .optional(),
    assignedToId: Joi.string().optional(),
    dueDate: Joi.date().optional(),
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
