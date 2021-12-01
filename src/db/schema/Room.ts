import mongoose from "mongoose";

interface User {
  userId: string;
  username: string;
  position: number;
  currentBalance: number;
  currentBet: number | undefined;
  currentHand: Card[] | undefined;
}
interface Card {
  value: number;
  suit: string;
}
interface Room {
  gameState: "WAITING" | "IN_PROGRESS" | "FINISHED";
  roomType: "PUBLIC" | "PRIVATE";
  rndCnt: number; // number of current round
  deck: Card[]; // array of cards
  cardsOnTable: Card[]; // array of visible cards for all users
  players: User[]; // array of players in the game
  roomOptions: Room_Options;
  currentPlayerId: string | undefined;
  creatorUserId: string;
  pot: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Room_Options {
  bigBlind: Number;
  smallBlind: Number;
}

export const roomSchema = new mongoose.Schema<Room>(
  {
    rndCnt: Number,
    roomType: String,
    deck: Array,
    cardsOnTable: Array,
    players: Array,
    roomOptions: Object,
    gameState: String,
    pot: Number,
    creatorUserId: String,
    currentPlayerId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Room = mongoose.model<Room>("Room", roomSchema);
