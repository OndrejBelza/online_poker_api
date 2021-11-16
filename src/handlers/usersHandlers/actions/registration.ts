import { Socket } from "socket.io";
import { User } from "../../../db/schema/User";
import schema from "./utils/userSchemaValidator";
const registrationHandler = (socket: Socket) => {
  socket.on("register", async (args) => {
    try {
      // validate args of request
      const validatedArgs = await schema.validate(args);
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
          socket.emit("registration_result", {
            result: false,
            error: {
              type: "duplicit_email",
              message: "This email is already used",
              path: "email",
            },
          });
        // else checks if username is unique
        else if (users.some((u) => u.username === validatedArgs.username))
          socket.emit("registration_result", {
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
      const user = new User({ ...validatedArgs });
      // save it to db
      await user.save();
      // and emit success to front end
      socket.emit("registration_result", {
        result: true,
        error: null,
      });
    } catch (error: any) {
      console.log(error);
      socket.emit("registration_result", {
        result: false,
        error: {
          type: error.name,
          message: error.message,
          path: error.path,
        },
      });
    }
  });
};

export default registrationHandler;
