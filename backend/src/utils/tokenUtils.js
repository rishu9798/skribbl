import  jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()

const SECRET = process.env.JWT_SECRET ;
const EXPIRES = process.env.JWT_EXPIRES_IN ;


//Sign a JWT for a user
 
const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: EXPIRES });


// Verify and decode a JWT. Returns decoded payload or throws.
 
const verifyToken = (token) => jwt.verify(token, SECRET);


// Extract token from request Authorization header or cookie
 
const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
};

export { signToken, verifyToken, extractToken };
