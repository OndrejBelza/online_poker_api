import { Request } from "express";
import { Socket } from "socket.io";
import { BIG_BLIND, SMALL_BLIND } from "../../../constants/intialGameValues";
import { Room, User } from "../../../db/schema";
import { Session } from "../../../types/session";

interface CreateGameResponse {
  id: string;
}

type CreateGameRequest = {
  gameType: "PRIVATE" | "PUBLIC";
};

const createHandler = (socket: Socket) => {
  socket.on("create_game", async (opts: CreateGameRequest) => {
    const session = (socket.request as Request).session as Session;

    // if user is not logged in he is not able create new room
    // or user didn't provide all data
    if (!session.userId || !opts) return;

    const user = await User.findById(session.userId);

    // or user was not found in db
    if (!user) return;

    // creates new instance of the game
    var room = new Room();

    // sets initial data for game
    room.rndCnt = 0;
    room.gameState = "WAITING";
    room.roomType = opts.gameType;
    room.pot = 0;
    room.deck = [];
    room.cardsOnTable = [];
    room.roomOptions = {
      smallBlind: SMALL_BLIND,
      bigBlind: BIG_BLIND,
    };
    room.currentPlayerId = undefined;
    room.creatorUserId = user._id;
    room.currentRoundBet = 0;
    room.players = [];

    await room.save();

    console.log(`Game created with id = ${room._id}`);

    const gameData: CreateGameResponse = {
      id: room._id,
    };

    socket.emit("game_created", gameData);
  });
};

export default createHandler;
