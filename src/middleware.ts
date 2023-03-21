import { Request, Response, NextFunction } from 'express';

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.user);
  if (!req.isAuthenticated()) {
    console.log('you must be logged in');
    return res.redirect('/login');
  }
  next();
};

export { isLoggedIn };
