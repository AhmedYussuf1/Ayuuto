import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import {
  createGroup,
  getGroupById,
  getMembersByGroupId,
  updateGroup,
} from "../controllers/groupController.js";

const router = express.Router();

// POST /group
router.post("/", verifyFirebaseToken, createGroup);

// GET /group/member/:id
router.get("/member/:id", verifyFirebaseToken, getMembersByGroupId);

// GET /group/:id
router.get("/:id", verifyFirebaseToken, getGroupById);

// PUT /group/:id
router.put("/:id", verifyFirebaseToken, updateGroup);

export default router;