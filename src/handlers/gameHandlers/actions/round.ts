
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
            room.markModified("players");
            break;
        case 1:
            for (let i=0;i<3;i++){
                var card = room.deck.shift();
                if (!card) break;
                room.cardsOnTable.push(card);
            }
            break;
        case 1:
            for (let i=0;i<3;i++){
                var card = room.deck.shift();
                if (!card) break;
                room.cardsOnTable.push(card);
            }
            break;
        case 2:
            var card = room.deck.shift();
            if (!card) break;
            room.cardsOnTable.push(card);
            break;
        case 3:
            var card = room.deck.shift();
            if (!card) break;
            room.cardsOnTable.push(card);
            break;    
        default:
            break;
    }

    await room.save();

    socket.emit("round_started")
    socket.in(`Room_${id}`).emit("round_started")
};

export default roundHandler;