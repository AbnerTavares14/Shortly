import db from "../db.js";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from 'uuid';
import { validation } from "../services/validation.js";

export async function signUp(req, res) {
    const { body } = req;
    const authSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().required(),
        password: joi.string().required(),
        confirmPassword: joi.ref('password')
    });
    validation(authSchema, body);
    try {
        const user = await db.query('SELECT email FROM users WHERE email = $1', [body.email]);
        if (user.rows[0]) {
            return res.sendStatus(409);
        }
        const encryptedPassword = bcrypt.hashSync(body.password, 10);
        await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [body.name, body.email, encryptedPassword]);
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

export async function singIn(req, res) {
    const { body } = req;
    const authSchema = joi.object({
        email: joi.string().required(),
        password: joi.string().required()
    });
    validation(authSchema, body);
    try {
        const user = await db.query('SELECT password, id FROM users WHERE email = $1', [body.email]);
        if (user.rows[0] && bcrypt.compareSync(body.password, user.rows[0].password)) {
            const token = uuid();
            await db.query('INSERT INTO sessions ("userId", token) VALUES ($1,$2)', [user.rows[0].id, token]);
            res.send(token);
        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        console.log("Deu erro no login", err);
        res.sendStatus(500);
    }
}