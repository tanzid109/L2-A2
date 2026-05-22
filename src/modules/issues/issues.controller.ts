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

const getAllIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssueFromDB(req.query);
    sendResponse(res, 200, {
      success: true,
      message: "Data fetched Succesfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, 401, {
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id as string);
    if (!result) {
      return sendResponse(res, 404, {
        success: false,
        message: "Issue Not Found",
      });
    }
    sendResponse(res, 200, {
      success: true,
      message: "Issue fetched Successfully",
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

const updateSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    const result = await issueService.updateSingleIssueInDB(
      req.body,
      id as string,
      userId,
      userRole,
    );
    if (!result) {
      return sendResponse(res, 404, {
        success: false,
        message: "Issue Not Found",
      });
    }
    if (result.unauthorized) {
      return sendResponse(res, 403, {
        success: false,
        message:
          "Maintainer can update any issue. Contributor can only update their own open issues",
      });
    }
    sendResponse(res, 200, {
      success: true,
      message: "Issue Updated Successfully",
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

export const issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateSingleIssue,
};
