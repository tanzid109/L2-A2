import type { Response } from "express";
import type { TResponse } from "../types";

const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: Omit<TResponse<T>, "statusCode">
) => {
  return res.status(statusCode).json(payload);
};
export default sendResponse;
