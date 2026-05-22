import { pool } from "../../db";
import type { IIssue, IIssueQuery } from "./issue.interface";

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

const getAllIssueFromDB = async (query: IIssueQuery) => {
  const { sort = "newest", type, status } = query;

  const result = await pool.query(
    `
    SELECT 
      I.id,
      I.title,
      I.description,
      I.type,
      I.status,
      JSON_BUILD_OBJECT(
        'id', U.id,
        'name', U.name,
        'role', U.role
      ) AS reporter,
      I.created_at,
      I.updated_at
    FROM issues I
    JOIN users U ON U.id = I.reporter_id
    WHERE I.type   = COALESCE($1, I.type)
      AND I.status = COALESCE($2, I.status)
    ORDER BY I.created_at ${sort === "newest" ? "DESC" : "ASC"}
  `,
    [type, status],
  );
  return result.rows;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT 
      I.id,
      I.title,
      I.description,
      I.type,
      I.status,
      JSON_BUILD_OBJECT(
        'id', U.id,
        'name', U.name,
        'role', U.role
      ) AS reporter,
      I.created_at,
      I.updated_at
    FROM issues I
    JOIN users U ON U.id = I.reporter_id
    WHERE I.id = $1
      `,
    [id],
  );
  return result.rows[0];
};

export const issueService = {
  createIssueInDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
};
