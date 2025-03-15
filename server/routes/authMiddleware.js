import jwt from "jsonwebtoken";

// Middleware for token verification
// https://www.slingacademy.com/article/authentication-authorization-expressjs-jwt/
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send("Token required");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid or expired token");
    req.user = user;
    console.log("middleware user", user);
    next();
  });
};
