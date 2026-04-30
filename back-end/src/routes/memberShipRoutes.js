import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import {
  createMembership,
  getMembershipsByGroupId,
  getMembershipsByMemberId,
  updateMembership,
} from "../controllers/membershipController.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createMembership);
router.get("/group/:id", verifyFirebaseToken, getMembershipsByGroupId);
router.get("/member/:id", verifyFirebaseToken, getMembershipsByMemberId);
router.put("/:id", verifyFirebaseToken, updateMembership);

export default router;