import mongoose from "mongoose";

interface User {
  user_id: string;
  username: string;
  position: number;
  current_balance: number;
  current_bet: number | undefined;
  current_hand: Card[] | undefined;
}
interface Card {
  value: number;
  suit: string;
}
interface Room {
  game_state: "WAITING" | "IN_PROGRESS" | "FINISHED";
  rnd_cnt: number; // number of current round
  deck: Card[]; // array of cards
  card_on_table: Card[]; // array of visible cards for all users
  users: User[]; // array of players in the game
  room_options: Room_Options;
  current_player_id: string | undefined;
  pot: number;
}

interface Room_Options {
  big_blind: Number;
  small_blind: Number;
}

export const roomSchema = new mongoose.Schema<Room>({
  rnd_cnt: Number,
  deck: Array,
  card_on_table: Array,
  users: Array,
  room_options: Object,
  game_state: String,
  pot: Number,
  current_player_id: {
    type: String,
    required: false,
  },
});

export const Room = mongoose.model<Room>("Room", roomSchema);
