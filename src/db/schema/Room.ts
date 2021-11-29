import mongoose from "mongoose";

interface User {
  id: number;
  username: string;
  current_balance: number;
  current_bet: number;
  current_hand: string;
}
interface Card {
  value: number,
  suit: string,
  skin: string,
  display: boolean
}
interface Room {
  id: string;
  rnd_cnt: number; // number of current round
  deck: Card[]; // array of cards
  card_on_table: Card[]; // array of visible cards for all users
  users: User[]; // array of players in the game
}

export const roomSchema = new mongoose.Schema<Room>({
  id: String,
  rnd_cnt: Number,
  deck: Array,
  card_on_table: Array,
  users: Array
})

export const Room = mongoose.model<Room>("Room", roomSchema);