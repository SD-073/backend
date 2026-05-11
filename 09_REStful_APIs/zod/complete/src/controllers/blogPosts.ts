// src/controllers/blogPosts.ts
import type { RequestHandler } from 'express';
import type { z } from 'zod/v4';
import type { blogPostInputSchema } from '#schemas';
import { BlogPost } from '#models';

type BlogPostInputDTO = z.infer<typeof blogPostInputSchema>;
type BlogPostDTO = BlogPostInputDTO & {
    _id: InstanceType<typeof Types.ObjectId>;
    createdAt: Date;
};
type IdParams = { id: string };

export const createBlogPost: RequestHandler<
    unknown,
    BlogPostDTO,
    BlogPostInputDTO
> = async (req, res) => {
    const newPost = await BlogPost.create(req.body satisfies BlogPostInputDTO);
    res.status(201).json(newPost);
};

export const getAllBlogPosts: RequestHandler<unknown, BlogPostDTO[]> = async (
    req,
    res
) => {
    const posts = await BlogPost.find().lean().sort({ createdAt: -1 });
    res.status(200).json(posts);
};

export const getBlogPostById: RequestHandler<IdParams, BlogPostDTO> = async (
    req,
    res
) => {
    const post = await BlogPost.findById(req.params.id).lean();
    if (!post) throw new Error('Post not found', { cause: { status: 404 } });
    res.status(200).json(post);
};

export const updateBlogPost: RequestHandler<
    IdParams,
    BlogPostDTO,
    BlogPostInputDTO
> = async (req, res) => {
    const updated = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    }).lean();
    if (!updated) throw new Error('Post not found', { cause: { status: 404 } });
    res.status(200).json(updated);
};

export const deleteBlogPost: RequestHandler<
    IdParams,
    { message: string }
> = async (req, res) => {
    const deleted = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deleted) throw new Error('Post not found', { cause: { status: 404 } });
    res.status(200).json({ message: 'Blog post deleted successfully' });
};