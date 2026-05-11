import { Router } from 'express';
import { createUser, getAllUsers } from '#controllers';

const userRoutes = Router();

userRoutes.get('/', getAllUsers);
userRoutes.post('/', createUser);

export default userRoutes;