
import { Socket } from "socket.io";
import { Room } from "../../../db/schema";


const roundHandler = async (socket: Socket, id: String) => {
    var room;
    if (id) {
      room = await Room.findById(id);
    }

    // if room doesn't exist we will not join him to the game
    if (!room) return;
    console.log(room.rndCnt)
    switch (room.rndCnt) {
        case 0:
            room.players[0]!.turn = true;
            break;
        case 1:
            for (let i=0;i<3;i++){
                var card = room.deck.shift();
                if (!card) break;
                room.cardsOnTable.push(card);
                room.currentRoundBet= 0;
            }
            for (let player of room.players) {
                player.currentBet = 0;
                if (player.current_action != "fold") player.current_action = null;
            }
            break;
        case 2:
            var card = room.deck.shift();
            if (!card) break;
            room.cardsOnTable.push(card);
            room.currentRoundBet= 0;
            for (let player of room.players) {
                player.currentBet = 0;
                if (player.current_action != "fold") player.current_action = null;
            }
            break;
        case 3:
            var card = room.deck.shift();
            if (!card) break;
            room.cardsOnTable.push(card);
            room.currentRoundBet= 0;
            for (let player of room.players) {
                player.currentBet = 0;
                if (player.current_action != "fold") player.current_action = null;
            }
            break;    
        case 4:
            socket.emit("game_finished","player XYZ won");
            room.rndCnt = 0;
            room.gameState = "WAITING";
            room.pot = 0;
            room.deck = [];
            room.cardsOnTable = [];
            room.currentRoundBet = 0;
            for (let player of room.players) {
                player.turn = false;
                player.current_action = null;
                player.currentBet = undefined;
                player.currentHand = undefined;
            }
            break;
        default:
            break;
    }

    room.markModified("players");
    await room.save();

    socket.emit("round_started")
    socket.in(`Room_${id}`).emit("round_started")
};

export default roundHandler;