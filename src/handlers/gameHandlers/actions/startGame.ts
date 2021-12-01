import { Request } from "express";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Room } from "../../../db/schema";
import { Session } from "../../../types/session";

const startGameHandler = (
  socket: Socket,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
  socket.on("start_game", async (id) => {
    // gets session for current request
    const session = (socket.request as Request).session as Session;

    // checks if user is logged in
    if (!id || !session.userId) return;

    // finds room
    const room = await Room.findById(id);
    if (
      !room ||
      room.creatorUserId !== session.userId ||
      !room.players ||
      !room.players.length
    )
      return;

    // updates game state
    room.gameState = "IN_PROGRESS";

    // and sets current player
    room.currentPlayerId = room.players[0]!.userId;

    // saves data to db
    await room.save();

    // emits event to all users in room
    io.to(`Room_${room._id}`).emit("game_started");
  });
};

export default startGameHandler;
