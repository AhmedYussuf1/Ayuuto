import express from "express";
import {
  createInvitation,
  getInvitationsByGroupId,
  updateInvitation,
} from "../controllers/invitationController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createInvitation);
router.get("/group/:id", verifyFirebaseToken, getInvitationsByGroupId);
router.put("/:id", verifyFirebaseToken, updateInvitation);

export default router;