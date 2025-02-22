import express from 'express';
import { configManager } from './src/config';
import { logger } from './src/utils/logger';

const app = express();
const config = configManager.getConfig();

app.listen(config.app.port, () => {
  logger.info(`Server is running on port ${config.app.port}`, {
    port: config.app.port,
    env: config.app.env,
  });
});
