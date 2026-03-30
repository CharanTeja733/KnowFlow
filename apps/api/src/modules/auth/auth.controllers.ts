import type { Request, Response } from "express";
import { comparePassword, generateHashedPassword } from "../../utils/hash";
import { getUserByEmail, createUser } from "./auth.services";
import { createUserToken } from "../../utils/token";
export async function signupController(req: Request, res: Response) {
    const {name, email, password} = req.body;
    
    const existingUser = await getUserByEmail(email);
    if(existingUser) {
        return res.status(400).json({error: `user with email id ${email} already exist`});
    }

    const hashedPassword = await generateHashedPassword(password);
    const user = {
        name,
        email,
        password: hashedPassword
    };
    const createdUser = await createUser(user);

    return res.status(201).json({user: createdUser});
    
}

export async function signinController(req: Request, res: Response) {
    const {email, password} = req.body;

    const user = await getUserByEmail(email);

    if(!user) {
        return res.status(400).json({error: `user with email id ${email} already not exist`}); 
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if(!isPasswordCorrect) {
        return res.status(401).json({error: 'invalid credentials'});
    }

    const payload = {
        name: user.name,
        id: user.id,
        email: user.email
    }
    const token = createUserToken(payload);

    return res.status(200).json({token});
}