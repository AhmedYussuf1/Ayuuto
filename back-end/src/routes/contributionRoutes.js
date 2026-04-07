import express from "express";
import {
  createContribution,
  getContributionsByGroupId,
  getContributionsByMemberId,
} from "../controllers/contributionController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createContribution);
router.get("/group/:id", verifyFirebaseToken, getContributionsByGroupId);
router.get("/member/:id", verifyFirebaseToken, getContributionsByMemberId);

export default router;