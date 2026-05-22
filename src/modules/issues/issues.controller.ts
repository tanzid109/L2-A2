import type { Request, Response } from "express";
import { issueService } from "./issues.service";
import sendResponse from "../../utils/sendResponse";

const createIssue = async (req: Request, res: Response) => {
  try {
    const reporter_id = req.user?.id;
    if (!reporter_id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const issueData = { ...req.body, reporter_id };
    const result = await issueService.createIssueInDB(issueData);
    sendResponse(res, 201, {
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, 500, {
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

export const issueController = {
  createIssue,
};
