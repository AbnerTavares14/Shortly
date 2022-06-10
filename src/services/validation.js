import joi from "joi";

export async function validation(object, body) {
    const validation = object.validate(body, { abortEarly: true });
    if (validation.error) {
        console.log(validation.error.details);
        return res.sendStatus(422);
    }
}