import * as ss from "superstruct";
import { HttpError } from "./errors";

export function validateApiRequest<T>(
  value: unknown,
  schema: ss.Struct<T, unknown>
): T {
  try {
    return ss.create(value, schema);
  } catch (error) {
    if (error instanceof ss.StructError) {
      console.warn("Validation error:", error.message);
      const issues = error
        .failures()
        .map((failure) => {
          const path =
            failure.path.length > 0 ? failure.path.join(".") : "root";
          return `${path}: ${failure.message}`;
        })
        .join("; ");

      throw new HttpError({
        statusCode: 400,
        msg: `Invalid Request: ${issues}`,
      });
    }

    // Fallback for unexpected errors
    throw new HttpError({
      statusCode: 400,
      msg: "Invalid Request. Unknown issue",
    });
  }
}
