import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { UserFromProtectHeaderMW } from "./protectHeaderMW.js";
import getErrorMessage from "../utils/getErrorMessage.js";
import objectIdSchema from "../utils/validators/schema/objectIdSchema.js";

const getProfileSchema = z.object({
  userId: objectIdSchema,
});

export type DataFromGetProfileValidatorMW = Required<z.infer<typeof getProfileSchema>>;

export default (
  req: Request<any, any, UserFromProtectHeaderMW, DataFromGetProfileValidatorMW>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.userId) req.params.userId = req.body.dbUser._id.toJSON();

    getProfileSchema.parse(req.params);

    next();
  } catch (err) {
    return res.status(400).json({
      isSuccess: false,
      error: getErrorMessage(err),
    });
  }
};
