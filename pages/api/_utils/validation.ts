import * as ss from "superstruct";
import { HttpError } from "./errors";
import { NextApiRequest } from "next";

export function validateQueryParams<T>(
  value: NextApiRequest["query"],
  schema: ss.Struct<T, unknown>
): T {
  return validateSchema(value, schema, "query");
}

export function validateBodyParams<T>(
  value: NextApiRequest["body"],
  schema: ss.Struct<T, unknown>
): T {
  return validateSchema(value, schema, "body");
}

function validateSchema<T>(
  value: unknown,
  schema: ss.Struct<T, unknown>,
  type: "body" | "query"
): T {
  try {
    return ss.create(value, schema);
  } catch (error) {
    const msg = type === "body" ? "Invalid Request Body" : "Invalid Request";

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
        msg: `${msg}: ${issues}`,
      });
    }

    // Fallback for unexpected errors
    throw new HttpError({
      statusCode: 400,
      msg: `${msg}. Unknown issue`,
    });
  }
}
