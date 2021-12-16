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

    var room;
    if (id) {
      console.log(`User ${session.userId} is joining room Room_${id}`);

      room = await Room.findById(id);
    } else {
      room = await Room.findOne({ room_type: "PUBLIC" }).sort("updatedAt");
    }

    // if room doesn't exist we will not join him to the game
    if (!room) return;

    room.players.push({
      userId: user._id,
      username: user.username,
      position: findFirstPosition(room.players),
      turn: false,
      current_action: null,
      currentBalance: STARTING_BALANCE,
      currentBet: undefined,
      currentHand: undefined,
    });

    await room.save();

    socket.join(`Room_${id}`);
    socket.emit("room_joined", room._id);
    socket
      .in(`Room_${id}`)
      .emit("user_has_joined", `New user ${user.username} has joined`);
  });
};

export default joinHandler;
