import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { authRoute } from "./modules/auth/auth.route";
import CookieParser from "cookie-parser";
import cors from "cors"
import { issueRoute } from "./modules/issues/issues.route";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(CookieParser());
const corsOptions = {
  origin: "http://localhost:5000,https://resolve-hq-two.vercel.app/",
};

app.use(cors(corsOptions));
app.get("/", (req: Request, res: Response) => {
  res.send("ResolveHQ Server is running");
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

app.use(globalErrorHandler);

export default app;
