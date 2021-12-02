import { Request } from "express";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Room } from "../../../db/schema";
import { Session } from "../../../types/session";
import { createDeck, shuffleDeck } from "./utils/deckUtils";

const startGameHandler = (
  socket: Socket,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
  socket.on("start_game", async (id) => {
    console.log("start_game_id", id);
    // gets session for current request
    const session = (socket.request as Request).session as Session;

    // checks if user is logged in
    if (!id || !session.userId) return;

    // finds room
    const room = await Room.findById(id);

    // checks if user is creator of that room
    if (!room || room.creatorUserId !== session.userId || !room.players) return;

    // game can be started only of there are two or more players
    // I will add this later
    // if (room.players.length < 2)
    //   return socket.emit("error_message", "Not enough players to start game!");

    // updates game state
    room.gameState = "IN_PROGRESS";

    // and sets current player
    room.currentPlayerId = room.players[0]!.userId;

    // saves data to db
    await room.save();

    // emits event to all users in room
    io.in(`Room_${room._id}`).emit("game_started");

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

        // emit event to selected user with values of that card
        io.to(`User_${player.userId}`).emit("deal_card", {
          playerId: player.userId,
          card: { value: card.value, suit: card.suit },
        });

        let otherPlayers = room.players.filter(
          (p) => p.userId !== player.userId
        );

        // emit event to other users without the card details
        for (let otherPlayer of otherPlayers) {
          io.in(`User_${otherPlayer.userId}`).emit("deal_card", {
            playerId: player.userId,
            card: { value: undefined, suit: undefined },
          });
        }

        room.markModified("players");
        await room.save();
      }
    }
  });
};

export default startGameHandler;
