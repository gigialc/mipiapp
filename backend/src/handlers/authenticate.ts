import { Request, Response, NextFunction } from 'express';
import platformAPIClient from "../services/platformAPIClient";
import { UserData } from "../types/user";

interface AuthenticatedRequest extends Request {
  user?: UserData;
}

const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const me = await platformAPIClient.get(`https://api.minepi.com/v2/me`, { headers: { 'Authorization': `Bearer ${token}` } });
    const userCollection = req.app.locals.userCollection;
    const user = await userCollection.findOne({ accessToken: token });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "Forbidden" });
  }
};

export default authenticate;
