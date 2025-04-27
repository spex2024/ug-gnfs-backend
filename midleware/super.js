import jwt from 'jsonwebtoken';

// Middleware to protect routes and check for super admin or self for the admin profile route
export const protectAdmin = (req, res, next) => {
    const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1]; // Get token from cookie or Authorization header
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user info to request object
        req.user = decoded;

        // // Check if the route is for getting the admin profile
        // if (req.method === 'GET' && req.originalUrl.includes('/get/')) {
        //     // Allow the admin to access their own profile
        //     if (req.user.role === 'admin' && req.params.id === req.user.id) {
        //         return next(); // Proceed if the user is an admin accessing their own profile
        //     }
        // }


        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
