import app from "./app";
import config from "./utils/config";

const main = async () => {
  app.listen(config.port, () => {
    console.log(`ResolveHQ server running on port ${config.port}`);
  });
};

main()
