import db from "../db.js";
import joi from "joi";
import { validation } from "../services/validation.js";
import { nanoid } from "nanoid";

export async function shortenLink(req, res) {
    const { body } = req;
    const { user } = res.locals;
    const linkSchema = joi.object({
        url: joi.string().pattern(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/).required()
    });
    validation(linkSchema, body);
    try {
        const shortLink = nanoid(9);
        await db.query('INSERT INTO links (url, "shortLink", "userId") VALUES ($1, $2, $3)', [body.url, shortLink, user]);
        res.send({ shortUrl: shortLink });
    } catch (err) {
        console.log("Deu erro no encurtamento da URL", err);
        res.sendStatus(500);
    }
}

export async function shortLink(req, res) {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT id, "shortLink" as "shortUrl", url FROM links WHERE id = $1', [id]);
        if (!result.rows[0]) {
            return res.sendStatus(404);
        }
        res.send(result.rows[0]);
    } catch (err) {
        console.log("Deu erro em recuperar o link em específico", err);
        res.sendStatus(500);
    }
}

export async function redirectToUrl(req, res) {
    const { shortUrl } = req.params;
    try {
        const result = await db.query(`SELECT url, "visitCount" FROM links WHERE "shortLink" = $1`, [shortUrl]);
        if (!result.rows[0]) {
            return res.sendStatus(404);
        }
        await db.query(`UPDATE links SET "visitCount" = $1 + 1 WHERE "shortLink" = $2`, [result.rows[0].visitCount, shortUrl]);
        res.redirect(result.rows[0].url);
    } catch (err) {
        console.log("Deu erro no redirecionamento do link", err);
        res.sendStatus(500);
    }
}

export async function deleteShortLink(req, res) {
    const { id } = req.params;
    const { user } = res.locals;
    try {
        const result = await db.query(`SELECT url, "userId" FROM links WHERE id=$1`, [id]);
        if (!result.rows[0]) {
            return res.sendStatus(404);
        }
        if (result.rows[0].userId !== user) {
            return res.sendStatus(401);
        }
        await db.query(`DELETE FROM links WHERE id=$1`, [id]);
        res.sendStatus(204);
    } catch (err) {
        console.log("Deu erro na deleção do link encurtado", err);
        res.sendStatus(500);
    }
}

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

export async function ranking(req, res) {
    try {
        const result = await db.query(`SELECT users.id, users.name, COUNT(links) as "linksCount", SUM("visitCount") as "visitCount"
            FROM links JOIN users ON users.id = links."userId"
            GROUP BY users.id ORDER BY "visitCount" desc LIMIT 10`);
        res.send(result.rows);
    } catch (err) {
        console.log("Deu erro no ranking", err);
        res.sendStatus(500);
    }
}