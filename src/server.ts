import app from "./app";
import { initDB } from "./db";
import config from "./utils/config";

const main = async () => {
  initDB();
  app.listen(config.port, () => {
    console.log(`ResolveHQ server running on port ${config.port}`);
  });
};

main();
