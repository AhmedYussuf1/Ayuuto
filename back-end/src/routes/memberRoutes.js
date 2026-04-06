import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import {
  getAllMembers,
  getMemberByFirebaseUid,
  getCurrentMember,
  getMemberById,
  createOrUpdateMember,
} from "../controllers/memberController.js";

const router = express.Router();

// GET /member
router.get("/", verifyFirebaseToken, getAllMembers);

// GET /member/firebase/:uid
router.get("/firebase/:uid", verifyFirebaseToken, getMemberByFirebaseUid);

// GET /member/me
router.get("/me", verifyFirebaseToken, getCurrentMember);

// GET /member/:id
router.get("/:id", verifyFirebaseToken, getMemberById);

// POST /member
router.post("/", verifyFirebaseToken, createOrUpdateMember);

export default router;