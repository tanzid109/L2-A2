import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";

const signUpUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.signUpUserIntoDB(req.body);
    sendResponse(res, 201, {
      success: true,
      message: "User Created Successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, 500, {
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};
const logInUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    sendResponse(res, 200, {
      success: true,
      message: "Login Successfull",
      data: result,
    });
  } catch (error) {
    sendResponse(res, 401, {
      success: false,
      message: "Something went wrong",
      error,
    });
    console.log(error);
  }
};

export const authController = {
  signUpUser,
  logInUser,
};
