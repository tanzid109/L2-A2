export const ROLE = {
  contributor: "contributor ",
  maintainer: "maintainer",
} as const;

export type STATUS = "open" | "in_progress" | "resolved";

export type ISSUE_TYPE = "bug" | "feature_request";

export interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}
