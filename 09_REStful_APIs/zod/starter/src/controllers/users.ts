import type { RequestHandler } from 'express';
import type { UserType } from '#types';
import { User } from '#models';

export const getAllUsers: RequestHandler = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

export const createUser: RequestHandler = async (req, res) => {
    try {
        const userData: UserType = req.body; // We'll learn about validation later
        const user = await User.create(userData);
        res.status(201).json(user);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};