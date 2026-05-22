import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

const createIssueInDB = async (payload: IIssue) => {
  const { title, description, type, status = "open", reporter_id } = payload;
  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, status,reporter_id)
    VALUES($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [title, description, type, status, reporter_id],
  );
  return result.rows[0];
};

export const issueService = {
  createIssueInDB,
};
