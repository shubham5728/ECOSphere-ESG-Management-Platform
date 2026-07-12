import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

type Source = "body" | "query" | "params";

/**
 * Validate a request part against a Zod schema.
 * On success the parsed (typed/coerced) value replaces the original.
 */
export function validate(schema: z.ZodTypeAny, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      // query/params are read-only getters in Express 5-safe way: mutate props.
      if (source === "body") req.body = parsed;
      else Object.assign(req[source], parsed);
      next();
    } catch (err) {
      if (err instanceof ZodError) return next(err);
      next(err);
    }
  };
}
