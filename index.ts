require("dotenv").config();

import express from "express";
import "reflect-metadata";
// import { producer } from "./src/cfg/kafka";
import { AppDataSource } from "./src/data-source";
import { errorHandler } from "./src/middleware/error";
import { authRouter } from "./src/modules/auth/auth.routes";
import { userRoutes } from "./src/modules/user/user.routes";

const cors = require("cors");

// const BASED_PATH = "/auth";

let main = async () => {
  // Db init
  try {
    await AppDataSource.initialize();
  } catch (err) {
    console.error(err);
  }

  const app = express();
  const port = process.env.PORT || 8080;

  // Middleware
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Mount routes
  app.use("/auth", authRouter);
  app.use("/auth/user", userRoutes);

  // Err handler
  app.use(errorHandler);

  // Run server
  app.listen(+port, async () => {
    console.log(`Server running at port: ${port}`);
    // await producer.connect();
  });
};

main();
