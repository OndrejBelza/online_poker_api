import { Request } from "express";
import { Socket } from "socket.io";
import { STARTING_BALANCE } from "../../../constants/intialGameValues";
import { Room, User } from "../../../db/schema";
import { Session } from "../../../types/session";
import { findFirstPosition } from "./utils/positionUtils";

const joinHandler = (socket: Socket) => {
  socket.on("join_game", async (id) => {
    const session = (socket.request as Request).session as Session;

    // if user is not logged in we will not join him to the game
    if (!session.userId) return;

    const user = await User.findById(session.userId);

    // if user doesn't exist we will not join him to the game
    if (!user) return;

    console.log(`User ${session.userId} is joining room Room_${id}`);

    const room = await Room.findById(id);

    // if room doesn't exist we will not join him to the game
    if (!room) return;

    room.users.push({
      user_id: user._id,
      username: user.username,
      position: findFirstPosition(room.users),
      current_balance: STARTING_BALANCE,
      current_bet: undefined,
      current_hand: undefined,
    });

    room.save();

    socket.join(`Room_${id}`);
    socket
      .in(`Room_${id}`)
      .emit("user_has_joined", `New user ${user.username} has joined`);
  });
};

export default joinHandler;
