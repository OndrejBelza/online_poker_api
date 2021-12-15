import { Router } from "express";
import { User } from "../../db/schema/User";
import registrationSchema from "./utils/registrationSchemaValidator";
import loginSchema from "./utils/loginSchemaValidator";
import editProfileSchema from "./utils/editProfileSchemaValidator";
import argon2 from "argon2";
import { Session } from "../../types/session";
import COOKIE_NAME from "../../constants/cookieName";
const usersRouter = Router();

usersRouter.post("/registration", async (req, res) => {
  try {
    const validatedArgs = await registrationSchema.validate(req.body);

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

usersRouter.post("/login", async (req, res) => {
  try {
    const validatedArgs = await loginSchema.validate(req.body);
    const user = await User.findOne({ email: validatedArgs.email });
    if (!user || (await argon2.verify(user.password, validatedArgs.password)))
      return res.status(400).send({
        result: false,
        error: {
          type: "invalid_username_or_password",
          message: "Invalid username or password",
          path: null,
        },
      });

    (req.session as Session).userId = user.id;
    return res.send();
  } catch (error: any) {
    return res.status(400).send({
      result: false,
      error: {
        type: error.name,
        message: error.message,
        path: error.path,
      },
    });
  }
});

usersRouter.get("/me", async (req, res) => {
  const id = (req.session as Session).userId;
  if (id) {
    const user = await User.findById(id);
    if (user)
      return res.send({
        username: user.username,
        email: user.email,
        id: user.id,
      });
  }
  return res.send();
});

usersRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie(COOKIE_NAME);
    if (err) return res.status(500).send("Logout unsuccessful");
    else return res.send("Logout successful");
  });
});

usersRouter.post("/edit_profile", async (req, res) => {
  try {
    const id = (req.session as Session).userId;
    if (id) {
      const validatedArgs = await editProfileSchema.validate(req.body);
      const user = await User.findById(id);

      if (
        !user ||
        !(await argon2.verify(user.password, validatedArgs.currentPassword))
      ) {
        return res.status(400).send({
          result: false,
          error: {
            type: "invalid_password",
            message: "Invalid password",
            path: null,
          },
        });
      }
      user.password = await argon2.hash(validatedArgs.newPassword);
      user.username = validatedArgs.username;
      user.email = validatedArgs.email;
      await user.save();
    }
    return res.send();
  } catch (error: any) {
    return res.status(400).send({
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
