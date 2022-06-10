import db from "../db.js";

export async function validateToken(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer", "").trim();
    if (!token) {
        return res.status(401).send("No token.");
    }
    try {
        const session = await db.query('SELECT token, "userId" FROM sessions WHERE token = $1', [token]);
        if (!session.rows[0]) {
            return res.status(401).send("No session.");
        }
        if (!session.rows[0].userId) {
            return res.sendStatus(404);
        }
        res.locals.user = session.rows[0].userId;
        next();
    } catch (error) {
        console.log("token", error);
        res.status(500).send("Error checking token.");
    }
}