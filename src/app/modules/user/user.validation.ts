import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    // user: z.object({
    firstName: z.string({ message: 'First Name is required' }),
    lastName: z.string({ message: 'Last Name is required' }),
    organizationId: z.string({ message: 'Organization ID is required' }),
    email: z.string({ message: 'Email is required' }),
    password: z.string({ message: 'Password is required' }),
    specialty: z.string().optional(),
    // facility: z.string().optional(),
    // hospitalName: z.string().optional(),
  }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  // location: z.string().optional(),
  image: z.string().optional(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
