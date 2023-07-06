import { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import { UserFromProtected } from "./protectMW.js";
import CATEGORIES from "../utils/categories.js";
import imageSchema from "../utils/validators/schema/imageSchema.js";

const postSchema = z.object({
  caption: z
    .string()
    .max(
      Number(process.env.MAX_POST_LENGTH),
      `Max post length cannot exceed ${process.env.MAX_POST_LENGTH} characters!`
    )
    .optional(),
  image: imageSchema,
  category: z.enum(CATEGORIES),
});

export type DataFromAddPost = Required<z.infer<typeof postSchema>>;

export default (
  req: Request<any, any, UserFromProtected>,
  res: Response,
  next: NextFunction
) => {
  try {
    postSchema.parse(req.body);

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errorsAfterParse = JSON.parse(err.message);

      return res.status(400).json({
        isSuccess: false,
        error: errorsAfterParse[0]?.message || err.message || "Something went wrong",
      });
    }

    return res.status(400).json({
      isSuccess: false,
      error: err.message || "Something went wrong",
    });
  }
};