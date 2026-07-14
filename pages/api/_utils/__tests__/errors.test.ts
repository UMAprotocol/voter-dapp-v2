import { NextApiResponse } from "next";
import { describe, expect, it, vi } from "vitest";
import { handleApiError, HttpError } from "../errors";

function makeMockResponse() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { response: { status } as unknown as NextApiResponse, status, json };
}

describe("handleApiError", () => {
  it("responds once with the HttpError status and does not fall through to 500", () => {
    const { response, status, json } = makeMockResponse();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    handleApiError(new HttpError({ statusCode: 404 }), response);

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledTimes(1);
    expect(json).toHaveBeenCalledWith({
      error: "Not Found",
      status: 404,
      statusText: "Not Found",
    });
  });

  it("responds with 500 for unexpected errors", () => {
    const { response, status, json } = makeMockResponse();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    handleApiError(new Error("boom"), response);

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: "boom",
      statusText: "Internal Server Error",
    });
  });
});
