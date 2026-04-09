import express from "express";
import {
  createPayout,
  getPayoutsByGroupId,
  getPayoutsByMemberId,
  updatePayout,
} from "../controllers/payoutController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createPayout);
router.get("/group/:id", verifyFirebaseToken, getPayoutsByGroupId);
router.get("/member/:id", verifyFirebaseToken, getPayoutsByMemberId);
router.put("/:id", verifyFirebaseToken, updatePayout);

export default router;