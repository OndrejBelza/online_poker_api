import { Request } from "express";
import { Socket } from "socket.io";
import {
  BIG_BLIND,
  SMALL_BLIND,
  STARTING_BALANCE,
} from "../../../constants/intialGameValues";
import { Room, User } from "../../../db/schema";
import { Session } from "../../../types/session";

interface CreateGameResponse {
  id: string;
}

const createHandler = (socket: Socket) => {
  socket.on("create_game", async () => {
    const session = (socket.request as Request).session as Session;

    // if user is not logged in he is not able create new room
    if (!session.userId) return;

    const user = await User.findById(session.userId);

    // or user was not found in db
    if (!user) return;

    // creates new instance of the game
    var room = new Room();

    // sets initial data for game
    room.rnd_cnt = 0;
    room.game_state = "WAITING";
    room.deck = [];
    room.card_on_table = [];
    room.room_options = {
      small_blind: SMALL_BLIND,
      big_blind: BIG_BLIND,
    };
    room.current_player_id = undefined;
    room.users = [];

    await room.save();

    console.log(`Game created with id = ${room._id}`);

    const gameData: CreateGameResponse = {
      id: room._id,
    };

    socket.emit("game_created", gameData);
  });
};

export default createHandler;
