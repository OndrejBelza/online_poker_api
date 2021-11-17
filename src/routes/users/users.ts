import { Router } from "express";
import { User } from "../../db/schema/User";
import schema from "./utils/userSchemaValidator";
import argon2 from "argon2";
import { Session } from "../../types/session";
const usersRouter = Router();

usersRouter.post("/registration", async (req, res) => {
  try {
    const validatedArgs = await schema.validate(req.body);

    // looks for users with same user name or email
    // we will require unique username and email
    const users = await User.find({
      $or: [
        { username: validatedArgs.username },
        { email: validatedArgs.email },
      ],
    });
    // this will be true if some user has same username or email
    if (users.length) {
      // checks if email is unique
      if (users.some((u) => u.email === validatedArgs.email))
        res.status(400).send({
          result: false,
          error: {
            type: "duplicit_email",
            message: "This email is already used",
            path: "email",
          },
        });
      // else checks if username is unique
      else if (users.some((u) => u.username === validatedArgs.username))
        res.status(400).send({
          result: false,
          error: {
            type: "duplicit_username",
            message: "This username is already taken",
            path: "username",
          },
        });

      // stops function execution
      return;
    }
    // if username and email is unique we will create new user
    const user = new User({
      ...validatedArgs,
      password: await argon2.hash(validatedArgs.password),
    });

    // save it to db
    await user.save();

    (req.session as Session).userId = user.id;

    res.send();
  } catch (error: any) {
    res.status(400).send({
      result: false,
      error: {
        type: error.name,
        message: error.message,
        path: error.path,
      },
    });
  }
});

export default usersRouter;
