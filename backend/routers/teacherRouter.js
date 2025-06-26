import { Router } from "express";
import {
  appointmentController,
  loginTeacher,
  logoutTeacher,
  registerTeacher,
} from "../controllers/teacherController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/registerTeacher").post(registerTeacher);
router.route("/loginTeacher").post(loginTeacher);
router.route("/appointmentController").put(verifyJWT, appointmentController);
router.route("/logoutTeacher").post(verifyJWT, logoutTeacher);

export default router;
