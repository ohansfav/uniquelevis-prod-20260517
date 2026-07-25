import app from "./app";
import { env } from "./config/env.js";
import { logger } from "./lib/logger";

const port = env.PORT || 8080;

app.listen(port, () => {
  logger.info({ port }, "Server listening");
});
