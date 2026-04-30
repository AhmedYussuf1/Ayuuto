import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

import {
  createGroup,
  getGroupById,
  getMembersByGroupId,
  updateGroup,

  //ADDED
  getGroupByInviteCode,
} from "../controllers/groupController.js";

const router = express.Router();

// Create group
router.post("/", verifyFirebaseToken, createGroup);

// ADDED: Invite code lookup (MUST be before /:id)
router.get("/code/:invite_code", verifyFirebaseToken, getGroupByInviteCode);

// Get members in group
router.get("/:id/members", verifyFirebaseToken, getMembersByGroupId);

// Get group by ID
router.get("/:id", verifyFirebaseToken, getGroupById);

// Update group
router.put("/:id", verifyFirebaseToken, updateGroup);

export default router;