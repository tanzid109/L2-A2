import express, {
  type Application,
  type Request,
  type Response,
} from "express";

const app: Application = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

export default app;
