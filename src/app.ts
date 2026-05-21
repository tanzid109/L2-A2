import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { authRoute } from "./modules/auth/auth.route";
import CookieParser from "cookie-parser";

const app: Application = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(CookieParser());
app.get("/", (req: Request, res: Response) => {
  res.send("ResolveHQ Server is running");
});

app.use("/api/auth", authRoute);

export default app;
