import { Router } from "express";
import {
  loginStudent,
  logoutStudent,
  registerStudent,
  searchTeacher,
} from "../controllers/studentController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/registerStudent").post(registerStudent);
router.route("/loginStudent").post(loginStudent);
router.route("/searchTeacher").post(verifyJWT, searchTeacher);
router.route("/logoutStudent").post(verifyJWT, logoutStudent);

export default router;
