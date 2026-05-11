// src/schemas/blogPost.ts
import { z } from 'zod/v4';
import { Types } from 'mongoose';

export const blogPostInputSchema = z.strictObject({
    title: z.string({ error: 'Title must be a string' }).min(1, {
        message: 'Title is required'
    }),
    content: z.string({ error: 'Content must be a string' }).min(1, {
        message: 'Content is required'
    })
});