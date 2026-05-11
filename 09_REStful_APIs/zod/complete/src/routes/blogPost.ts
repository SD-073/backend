// src/routes/blogPosts.ts
import { Router } from 'express';
import {
    createBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    updateBlogPost,
    deleteBlogPost
} from '#controllers';
import { validateBody } from '#middleware';
import { blogPostInputSchema } from '#schemas';

const blogPostRoutes = Router();

blogPostRoutes
    .route('/')
    .get(getAllBlogPosts)
    .post(validateBody(blogPostInputSchema), createBlogPost); // <= Middleware
blogPostRoutes
    .route('/:id')
    .get(getBlogPostById)
    .put(validateBody(blogPostInputSchema), updateBlogPost) // <= Middleware
    .delete(deleteBlogPost);

export default blogPostRoutes;