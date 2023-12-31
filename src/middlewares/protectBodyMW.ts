import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { IUser } from "../models/userModel.js";
import tokenSchema from "../utils/validators/schema/tokenSchema.js";
import getUserByToken from "../utils/getUserByToken.js";
import { DataFromSkipIsActiveMW } from "./skipIsActiveCheckingMW.js";
import getErrorMessage from "../utils/getErrorMessage.js";

const tokenBodySchema = z.object({
  token: tokenSchema,
});

export type UserFromProtectBodyMW = Required<z.infer<typeof tokenBodySchema>> & {
  dbUser: IUser;
};

export default async (
  req: Request<any, any, UserFromProtectBodyMW & DataFromSkipIsActiveMW>,
  res: Response,
  next: NextFunction
) => {
  try {
    tokenBodySchema.parse(req.body);

    const dbUser = await getUserByToken(req.body.token as string);

    req.body.dbUser = dbUser;

    if (!req.body.skipIsActiveChecking && dbUser.inActive)
      throw new Error("User is not active");

    next();
  } catch (err) {
    return res.status(400).json({
      isSuccess: false,
      error: getErrorMessage(err),
    });
  }
};
