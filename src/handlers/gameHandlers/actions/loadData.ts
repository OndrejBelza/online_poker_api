import { Request } from "express";
import { Socket } from "socket.io";
import { Room, User } from "../../../db/schema";
import { Session } from "../../../types/session";
interface Card {
  value: number | undefined;
  suit: string | undefined;
}
interface Player {
  id: string;
  position: number;
  chips: number;
  username: string;
  current_bet: number | undefined;
  hand: Card[] | undefined;
}
interface GameData {
  id: string;
  game_state: "WAITING" | "IN_PROGRESS" | "FINISHED";
  current_pot: number;
  players: Player[];
  current_player_id: string | undefined;
}

const loadDataHandler = (socket: Socket) => {
  socket.on("get_game_data", async (id) => {
    const session = (socket.request as Request).session as Session;

    // if user is not logged in we will not join him to the game
    if (!session.userId) return;

    const user = await User.findById(session.userId);

    // if user doesn't exist we will not join him to the game
    if (!user) return;

    console.log(
      `User ${session.userId} is loading game data from room Room_${id}`
    );

    const room = await Room.findById(id);

    // if room doesn't exist we will not join him to the game
    // or if user is not joined in the game
    if (!room || !room.users.some((u) => u.user_id === user._id)) return;

    const data: GameData = {
      id: room._id,
      game_state: room.game_state,
      current_player_id: room.current_player_id,
      current_pot: room.pot,
      players: room.users.map((u) => {
        return {
          id: u.user_id,
          username: u.username,
          position: u.position,
          chips: u.current_balance,
          current_bet: u.current_bet,
          hand: u.current_hand?.map((c) => {
            if (u.user_id === user._id)
              return {
                value: c.value,
                suit: c.suit,
              };
            return {
              value: undefined,
              suit: undefined,
            };
          }),
        };
      }),
    };

    socket.emit("game_data", data);
  });
};

export default loadDataHandler;
