import { Request } from "express";
import { Socket } from "socket.io";
import { Room, User } from "../../../db/schema";
import { Session } from "../../../types/session";
interface Card {
  value: string | undefined;
  suit: string | undefined;
}
interface Player {
  id: string;
  position: number;
  turn: boolean;
  chips: number;
  username: string;
  current_bet: number | undefined;
  current_action: string | null;
  hand: Card[] | undefined;
}
interface GameData {
  id: string;
  gameState: "WAITING" | "IN_PROGRESS" | "FINISHED";
  currentPot: number;
  blind: number;
  cardsOnTable: Card[];
  players: Player[];
  currentPlayerId: string | undefined;
  currentRoundBet: number;
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
    if (!room || !room.players.some((p) => p.userId.toString() === user._id.toString())) return;

    const data: GameData = {
      id: room._id,
      gameState: room.gameState,
      currentPlayerId: user._id.toString(),
      currentPot: room.pot,
      blind: room.roomOptions.bigBlind,
      currentRoundBet: room.currentRoundBet,
      cardsOnTable: room.cardsOnTable,
      players: room.players.map((u) => {
        return {
          id: u.userId,
          username: u.username,
          position: u.position,
          turn: u.turn,
          chips: u.currentBalance,
          current_bet: u.currentBet,
          current_action: u.current_action,
          hand: u.currentHand?.map((c) => {
            if (u.userId.toString() === user._id.toString())
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
