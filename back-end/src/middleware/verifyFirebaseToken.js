import admin from "firebase-admin";

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided or invalid format",
      });
    }

    // Extract token only
    const token = authHeader.split(" ")[1];

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Save decoded user info on the request object
    req.user = decodedToken;

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({
      error: "Unauthorized",
    });
  }
};

export default verifyFirebaseToken;