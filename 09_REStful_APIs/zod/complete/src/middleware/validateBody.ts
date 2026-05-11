// src/middleware/validateBody.ts
import type { RequestHandler } from 'express';
import type { ZodObject } from 'zod/v4';
import { z } from 'zod/v4';

const validateBody =
    (zodSchema: ZodObject): RequestHandler =>
    (req, res, next) => {
        if (!req.body) {
            next(new Error('Request body is missing.', { cause: { status: 400 } }));
        }
        const { data, error, success } = zodSchema.safeParse(req.body);
        if (!success) {
            next(
                new Error(z.prettifyError(error), {
                    cause: {
                        status: 400
                    }
                })
            );
        } else {
            req.body = data;
            next();
        }
    };

export default validateBody;