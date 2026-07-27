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

router.get("/users",authMiddleware, authorizeRoles("ROOT", "ADMIN", "USER", "GUEST"), getUsers);

router.post("/users",authMiddleware, authorizeRoles("ROOT", "ADMIN"), createUser);

router.put("/users/:id",authMiddleware, authorizeRoles("ROOT", "ADMIN"), updateUser);

router.delete("/users/:id",authMiddleware, authorizeRoles("ROOT", "ADMIN"), deleteUser);

export default router;
