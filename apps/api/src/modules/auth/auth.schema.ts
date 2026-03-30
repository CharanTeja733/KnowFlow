import {z } from 'zod';

export const signupSchema = z.object({
    body: z.object({
        name: z.string().max(255),
        email: z.email(),
        password: z.string().min(6)
    })
})

export const signinSchema = z.object({
    body: z.object({
        email: z.email(),
        password: z.string().min(6)
    })
})

export type Signup = z.infer<typeof signupSchema>['body'];
export type Signin = z.infer<typeof signinSchema>['body'];