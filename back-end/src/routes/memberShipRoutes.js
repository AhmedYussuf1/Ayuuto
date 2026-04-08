 import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import {
  createMembership,
  getMembershipsByGroupId,
  getMembershipsByMemberId,
  updateMembership,
} from  "../controllers/memberShipController.js";

const router = express.Router();

// POST /membership
router.post("/", verifyFirebaseToken, createMembership);

// GET /membership/group/:id
router.get("/group/:id", verifyFirebaseToken, getMembershipsByGroupId);

// GET /membership/member/:id
router.get("/member/:id", verifyFirebaseToken, getMembershipsByMemberId);

// PUT /membership/:id
router.put("/:id", verifyFirebaseToken, updateMembership);

export default router;