import { Router } from "express";
import {
  CurrentUserRole,
  getCurrentUser,
} from "../controllers/authController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/getUserRole").post(CurrentUserRole);
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);

export default router;
