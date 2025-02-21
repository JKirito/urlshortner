import express from "express";
import { configManager } from "./src/config";

const app = express();
const config = configManager.getConfig();

app.listen(config.app.port, () => {
  console.log(`Server is running on port ${config.app.port}`);
});


