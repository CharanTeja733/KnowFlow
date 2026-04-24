import type { Request, Response } from "express";
import { comparePassword, generateHashedPassword } from "../../utils/hash";
import { getUserByEmail, createUser, registerUser, verifyEmailService, loginUser, refreshAccessToken,logoutUser, forgotPassword, resetPassword } from "./auth.services";

import * as services from "./auth.services";
import { createUserToken } from "../../utils/token";
import { ApiError } from "@/lib/errors";

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

export async function registerController(req: Request, res: Response) {
    const {name, email, password} = req.body;

    const existingUser = await getUserByEmail(email);
    if(existingUser) {
        return res.status(400).json({error: `user with email id ${email} already exist`});
    } 

    await registerUser({name, email, password});

    return res.status(201).json({status: 'success', message: "email is send for verification"});
}

export async function verificationController(req: Request, res: Response) {
 
    const token = req.query.token as string;

    const result = await verifyEmailService(token);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
}

export async function loginController(req: Request, res: Response) {
    const {email, password} = req.body;

    const result = await loginUser(email, password);
    
    return res.status(200).json({success: true, data: result})
}


export async function refreshTokenController(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken as string;

    if(!refreshAccessToken) {
        throw new ApiError(401, "Require Refresh Token")
    }

    const tokens = await refreshAccessToken(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    res.status(200).json({
        success: true,
        accessToken: tokens.accessToken,
    });
}




export async function logoutController(req: Request, res: Response) {
    const userId = req.user?.id as string;

    await logoutUser(userId);
     
    res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

   res.status(200).json({
        success: true,
        message: "Logout out successfully"
    });
}



export async function forgotPasswordController(req: Request, res: Response) {
     const { email } = req.body;

    await forgotPassword(email);

    res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
} 

export async function resetPasswordController(req: Request, res: Response) {
     const { token, password } = req.body;

    await resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
}