import { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { UserFromProtectHeaderMW } from "./protectHeaderMW.js";
import getErrorMessage from "../utils/getErrorMessage.js";

const searchSchema = z.object({
  userId: z.any({ required_error: "User ID is required!" }).refine((val) => {
    return isValidObjectId(val);
  }, "Invalid user id"),
});

export type DataFromGetProfileValidatorMW = Required<z.infer<typeof searchSchema>>;

export default (
  req: Request<any, any, UserFromProtectHeaderMW, DataFromGetProfileValidatorMW>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.userId) req.params.userId = req.body.dbUser._id;

    searchSchema.parse(req.params);

    next();
  } catch (err) {
    return res.status(400).json({
      isSuccess: false,
      error: getErrorMessage(err),
    });
  }
};