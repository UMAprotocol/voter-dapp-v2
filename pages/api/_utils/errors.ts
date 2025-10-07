import { NextApiResponse } from "next";

export const STATUS_CODES = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
} as const;

export class HttpError extends Error {
  public statusCode: keyof typeof STATUS_CODES;
  public statusText: string;

  constructor(params: {
    statusCode: keyof typeof STATUS_CODES;
    msg?: ConstructorParameters<typeof Error>[0] | undefined;
    options?: ConstructorParameters<typeof Error>[1] | undefined;
  }) {
    const msg = params.msg ?? STATUS_CODES[params.statusCode];
    super(msg, params.options);
    this.statusCode = params.statusCode;
    this.statusText = STATUS_CODES[params.statusCode];
  }

  toJSON() {
    return {
      error: this.message,
      status: this.statusCode,
      statusText: this.statusText,
    };
  }
}

export function handleApiError(
  error: unknown,
  response: NextApiResponse
): void {
  if (error instanceof HttpError) {
    console.error(`HTTP Error ${error.statusCode}: ${error.message}`, {
      statusCode: error.statusCode,
      statusText: error.statusText,
    });
    response.status(error.statusCode).json(error.toJSON());
  }

  console.error("Unexpected API error:", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  response.status(500).json({
    error: error instanceof Error ? error.message : "Internal Server Error",
    statusText: STATUS_CODES[500],
  });
}
