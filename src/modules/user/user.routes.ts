import { Router } from "express";
import {
  deleteUserController,
  findUserController,
  truncateUserController,
  updateUserController,
} from "./user.controller";

export const userRoutes = Router();

userRoutes.get("/find/:id", findUserController);

userRoutes.put("/update", updateUserController);

userRoutes.delete("/delete/:id", deleteUserController);

userRoutes.delete("/truncate/:id", truncateUserController);
