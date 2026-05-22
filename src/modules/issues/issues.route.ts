import { Router } from "express";
import { issueController } from "./issues.controller";
import auth from "../../middleware/auth.middleware";
import { ROLE } from "../../types";

const router = Router();

router.post("/", auth(ROLE.contributor), issueController.createIssue);
router.get("/", issueController.getAllIssue);
router.get("/:id",issueController.getSingleIssue)

export const issueRoute = router;
