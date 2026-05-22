

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"), 1);

// src/modules/auth/auth.route.ts
var import_express = require("express");

// src/utils/sendResponse.ts
var sendResponse = (res, statusCode, payload) => {
  return res.status(statusCode).json(payload);
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// src/db/index.ts
var import_pg = require("pg");

// src/utils/config.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  connection_string: process.env.CONNECTION_STRING,
  jwt_secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new import_pg.Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'contributor',
    CHECK (role IN ('contributor', 'maintainer')),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    );
    `);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS issues(
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    CHECK (LENGTH(description) >= 20),

    type VARCHAR(50) NOT NULL,
    CHECK (type IN ('bug', 'feature_request')),

    status VARCHAR(20) NOT NULL DEFAULT 'open',
    CHECK (status IN ('open', 'in_progress', 'resolved')),

    reporter_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    )
    `);
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
var signUpUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload || {};
  const hashedPassword = await import_bcryptjs.default.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `,
    [name, email, hashedPassword, role]
  );
  delete result.rows[0].password;
  return result.rows[0];
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload || {};
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  const user = userData.rows[0];
  const passwordValidation = await import_bcryptjs.default.compare(password, user.password);
  if (!passwordValidation) {
    throw new Error("Invalid Credentials");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const accessToken = import_jsonwebtoken.default.sign(jwtPayload, config_default.jwt_secret, {
    expiresIn: "1d"
  });
  delete user.password;
  return { accessToken, user };
};
var authService = {
  signUpUserIntoDB,
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var signUpUser = async (req, res) => {
  try {
    const result = await authService.signUpUserIntoDB(req.body);
    sendResponse_default(res, 201, {
      success: true,
      message: "User created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, 500, {
      success: false,
      message: "Failed to create user account",
      error
    });
  }
};
var logInUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    sendResponse_default(res, 200, {
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, 401, {
      success: false,
      message: "Invalid email or password",
      error
    });
    console.log(error);
  }
};
var authController = {
  signUpUser,
  logInUser
};

// src/modules/auth/auth.route.ts
var router = (0, import_express.Router)();
router.post("/signup", authController.signUpUser);
router.post("/login", authController.logInUser);
var authRoute = router;

// src/app.ts
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_cors = __toESM(require("cors"), 1);

// src/modules/issues/issues.route.ts
var import_express2 = require("express");

// src/modules/issues/issues.service.ts
var createIssueInDB = async (payload) => {
  const { title, description, type, status = "open", reporter_id } = payload;
  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, status,reporter_id)
    VALUES($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [title, description, type, status, reporter_id]
  );
  return result.rows[0];
};
var getAllIssueFromDB = async (query) => {
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
    [type, status]
  );
  return result.rows;
};
var getSingleIssueFromDB = async (id) => {
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
    [id]
  );
  return result.rows[0];
};
var updateSingleIssueInDB = async (payload, id, userId, userRole) => {
  const issueCheck = await pool.query(
    `SELECT reporter_id, status FROM issues WHERE id = $1`,
    [id]
  );
  if (issueCheck.rows.length === 0) {
    return null;
  }
  const { reporter_id: reporterId, status: issueStatus } = issueCheck.rows[0];
  const isMaintainer = userRole === "maintainer";
  const isOwner = Number(userId) === Number(reporterId);
  const isOpen = issueStatus === "open";
  if (!isMaintainer && !(isOwner && isOpen)) {
    return { unauthorized: true };
  }
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
    UPDATE issues SET 
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4,status)
      WHERE id=$5 RETURNING *
    `,
    [title, description, type, status, id]
  );
  return result.rows[0];
};
var deleteSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `DELETE FROM issues WHERE id=$1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};
var issueService = {
  createIssueInDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateSingleIssueInDB,
  deleteSingleIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const reporter_id = req.user?.id;
    if (!reporter_id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const issueData = { ...req.body, reporter_id };
    const result = await issueService.createIssueInDB(issueData);
    sendResponse_default(res, 201, {
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, 500, {
      success: false,
      message: "Internal server error",
      error
    });
  }
};
var getAllIssue = async (req, res) => {
  try {
    const result = await issueService.getAllIssueFromDB(req.query);
    sendResponse_default(res, 200, {
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, 500, {
      success: false,
      message: "Failed to retrieve issues",
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    if (!result) {
      return sendResponse_default(res, 404, {
        success: false,
        message: "Issue not found"
      });
    }
    sendResponse_default(res, 200, {
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, 500, {
      success: false,
      message: "Failed to retrieve issue",
      error
    });
  }
};
var updateSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const result = await issueService.updateSingleIssueInDB(
      req.body,
      id,
      userId,
      userRole
    );
    if (!result) {
      return sendResponse_default(res, 404, {
        success: false,
        message: "Issue not found"
      });
    }
    if (result.unauthorized) {
      return sendResponse_default(res, 403, {
        success: false,
        message: "Maintainer can update any issue. Contributor can only update their own open issues"
      });
    }
    sendResponse_default(res, 200, {
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, 500, {
      success: false,
      message: "Failed to update issue",
      error
    });
  }
};
var deleteSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteSingleIssueFromDB(id);
    if (!result) {
      return sendResponse_default(res, 404, {
        success: false,
        message: "Issue not found"
      });
    }
    sendResponse_default(res, 200, {
      success: true,
      message: "Issue deleted successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, 500, {
      success: false,
      message: "Failed to delete issue",
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateSingleIssue,
  deleteSingleIssue
};

// src/middleware/auth.middleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);

// src/types/index.ts
var ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middleware/auth.middleware.ts
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, 401, {
          success: false,
          message: "Unauthorized Access!!"
        });
      }
      const decodedData = import_jsonwebtoken2.default.verify(
        token,
        config_default.jwt_secret
      );
      req.user = decodedData;
      if (roles.length && !roles.includes(decodedData.role)) {
        return sendResponse_default(res, 403, {
          success: false,
          message: "Forbidden: Insufficient permissions"
        });
      }
      next();
    } catch (error) {
      return sendResponse_default(res, 401, {
        success: false,
        message: "Invalid or expired token"
      });
    }
  };
};
var auth_middleware_default = auth;

// src/modules/issues/issues.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/", auth_middleware_default(ROLE.contributor), issueController.createIssue);
router2.get("/", issueController.getAllIssue);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_middleware_default(), issueController.updateSingleIssue);
router2.delete("/:id", auth_middleware_default(ROLE.maintainer), issueController.deleteSingleIssue);
var issueRoute = router2;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var import_path2 = __toESM(require("path"), 1);
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.use(import_express3.default.text());
app.use(import_express3.default.urlencoded({ extended: true }));
app.use((0, import_cookie_parser.default)());
var corsOptions = {
  origin: ["http://localhost:5000", "https://resolve-hq-two.vercel.app"]
};
app.use((0, import_cors.default)(corsOptions));
app.get("/", (req, res) => {
  res.sendFile(import_path2.default.join(process.cwd(), "index.html"));
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = async () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`ResolveHQ server running on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.cjs.map