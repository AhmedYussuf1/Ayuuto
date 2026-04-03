import admin from "firebase-admin";

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization token" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export default verifyFirebaseToken;