import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { getStudentMessages, markAsRead } from "../controllers/messageController.js";

const router = Router();

router.route("/getStudentMessages").get(verifyJWT, getStudentMessages);
router.route("/markAsRead").post(verifyJWT, markAsRead);

export default router;
