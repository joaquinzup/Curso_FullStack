import express from "express";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

/*import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { authorizeRoles } from "../middlewares/role.middlewares.js";
*/
const router = express.Router();

router.get("/users", 
    
    getUsers);

router.post("/users",
  
     createUser);

router.put("/users/:id",
  
     updateUser);

router.delete("/users/:id",
  
     deleteUser);

export default router;
