import { Request } from "express";
import { Socket } from "socket.io";
// import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Room } from "../../../db/schema";
import { Session } from "../../../types/session";
import roundHandler from "./round";
import { createDeck, shuffleDeck } from "./utils/deckUtils";

const startGame = async (
  socket: Socket,
  // io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
  id: String
) => {
  // socket.on("start_game", async (id) => {
    console.log("start_game_id", id);
    // gets session for current request
    const session = (socket.request as Request).session as Session;

    // checks if user is logged in
    if (!id || !session.userId) return;
    
    // finds room
    const room = await Room.findById(id);
  
    // checks if user is creator of that room
    // if (!room || room.creatorUserId !== session.userId || !room.players) return;
    if (!room) return;
    // updates game state
    room.gameState = "IN_PROGRESS";

    // and sets current player
    room.currentPlayerId = room.players[0]!.userId;

    // saves data to db
    await room.save();

    // emits event to all users in room
    socket.in(`Room_${room._id}`).emit("game_started");

    // creates new deck for game
    const deck = shuffleDeck(createDeck());
    // console.log(deck);
    room.deck = deck;

    // saves deck to the room
    await room.save();

    console.log("here");
    // deals two cards to all players
    for (let index = 0; index < 2; index++) {
      for (let player of room.players) {
        // gets first card in deck
        let card = room.deck.shift();
        if (!card) continue;

        if (!player.currentHand) player.currentHand = [];

        player.currentHand.push(card);
        player.current_action = null;
        room.markModified("players");
        await room.save();
    
      }
    }
    socket.emit("game_started");
        socket
          .in(`Room_${id}`)
          .emit("game_started");

    roundHandler(socket,id)
  // });
};

export default startGame;
