import { Request } from "express";
import { Socket } from "socket.io";
import { User } from "../../../db/schema/User";
import { Session } from "../../../types/session";

const meHandler = (socket: Socket) => {
  socket.on("me", async () => {
    const session = (socket.request as Request).session as Session;
    const userId = session.userId;
    const user = await User.findById(userId);
    console.log("user", user, userId);
    if (!user) {
      socket.emit("me_response", {
        result: false,
        error: {
          message: "user_not_found",
        },
        data: null,
      });
      return;
    }
    socket.emit("me_response", {
      result: true,
      error: null,
      data: {
        username: user.username,
        email: user.email,
      },
    });
  });
};

export default meHandler;
