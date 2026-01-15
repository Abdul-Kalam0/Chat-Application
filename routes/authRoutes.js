import express from "express";
import {
  getMessages,
  getUsers,
  login,
  register,
} from "../controllers/authControllers.js";
const router = express.Router();

//register routes
router.post("/register", register);

//login routes
router.post("/login", login);

router.get("/users", getUsers);

router.get("/messages", getMessages);

export default router;
