import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import {
  createGroup,
  getGroupById,
  getGroupByInviteCode,
  getMembersByGroupId,
  updateGroup,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createGroup);

// IMPORTANT: this must come before "/:id"
router.get("/code/:invite_code", verifyFirebaseToken, getGroupByInviteCode);

router.get("/:id/members", verifyFirebaseToken, getMembersByGroupId);
router.get("/:id", verifyFirebaseToken, getGroupById);
router.put("/:id", verifyFirebaseToken, updateGroup);

export default router;