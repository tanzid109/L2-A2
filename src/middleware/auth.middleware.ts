import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { type ROLES } from "./../types/index";
import sendResponse from "../utils/sendResponse";
import config from "../utils/config";
const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse(res, 401, {
          success: false,
          message: "Unauthorized Access!!",
        });
      }
      const decodedData = jwt.verify(
        token as string,
        config.jwt_secret,
      ) as JwtPayload;
      req.user = decodedData;
      if (roles.length && !roles.includes(decodedData.role as ROLES)) {
        return sendResponse(res, 403, {
          success: false,
          message: "Forbidden: Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      return sendResponse(res, 401, {
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};
export default auth;
