import db from "../db.js";


export async function infosUser(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.sendStatus(401);
    }

    try {

        const result = await db.query(`SELECT u.name, u.id as "userId", l."shortLink" as "shortUrl", l.id, l."visitCount", l.url 
            FROM links l JOIN users u ON u.id = l."userId" 
            WHERE u.id = $1 `, [id]);
        if (result.rowCount < 1) {
            return res.sendStatus(404);
        }

        const visitCount = await db.query(`SELECT SUM("visitCount") FROM links WHERE "userId" = $1`, [id]);
        const data = {
            id: result.rows[0].userId,
            name: result.rows[0].name,
            visitCount: visitCount.rows[0].sum,
            shortenedUrls: []
        };

        result.rows.forEach((row) => {
            data.shortenedUrls.push({
                id: row.id,
                shortUrl: row.shortUrl,
                url: row.url,
                visitCount: row.visitCount
            });

        });

        res.status(200).send(data);
    } catch (err) {
        console.log("Deu erro no envio das informações do usuario", err);
        res.sendStatus(500);
    }
}