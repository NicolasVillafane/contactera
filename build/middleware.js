"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoggedIn = void 0;
const isLoggedIn = (req, res, next) => {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        console.log('you must be logged in');
        return res.redirect('/login');
    }
    next();
};
exports.isLoggedIn = isLoggedIn;
