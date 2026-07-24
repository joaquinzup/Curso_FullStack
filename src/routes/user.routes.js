import express from "express";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { authorizeRoles } from "../middlewares/role.middlewares.js";

const router = express.Router();

router.get("/users",authMiddleware, authorizeRoles("ROOT", "ADMIN", "USER"), getUsers);

router.post("/users",authMiddleware, authorizeRoles("ROOT", "ADMIN", "USER"), createUser);

router.put("/users/:id",authMiddleware, authorizeRoles("ROOT", "ADMIN", "USER"), updateUser);

router.delete("/users/:id",authMiddleware, authorizeRoles("ROOT", "ADMIN", "USER"), deleteUser);

export default router;
