import { Socket } from "socket.io";
import { Room } from "../../../db/schema";
import roundHandler from "./round";

var turnCount = 1;

const userActionsHandler = async (socket: Socket) => {
    //Fold
    socket.on("fold", async ({roomId, id}) => {
        if (!roomId) return;
        var room = await Room.findById(roomId);
        if (!room) return;

        console.log(`User ${id} folded`)
        
        for (let i = 0; i<room.players.length;i++){
            if(room.players[i]?.userId.toString()===id) {
                room.players[i]!.turn = false;
                room.players[i]!.current_action = "fold"
                room.players[(i+1)%room.players.length]!.turn = true;
                break;
            }
        }

        room.markModified("players");
        

        if (turnCount >= room.players.length) {
            turnCount = 1;
            room.rndCnt++
            await room.save();
            roundHandler(socket,roomId)
        } else {
            turnCount++;
        } 
        await room.save();
        
        socket.emit("player_action");
        socket.in(`Room_${roomId}`).emit("player_action")
    });
    //check
    socket.on("check", async ({roomId,id}) => {
        if (!roomId) return;
        var room = await Room.findById(roomId);
        if (!room) return;

        console.log(`User ${id} checked`)

        for (let i = 0; i<room.players.length;i++){
            if(room.players[i]?.userId.toString()===id) {
                room.players[i]!.turn = false;
                room.players[i]!.current_action = "check"
                room.players[(i+1)%room.players.length]!.turn = true;
                break;
            }
        }

        room.markModified("players");
        
        

        if (turnCount >= room.players.length) {
            turnCount = 1;
            room.rndCnt++
            await room.save();
            roundHandler(socket,roomId)
        } else {
            turnCount++;
        }

        await room.save();

        socket.emit("player_action");
        socket.in(`Room_${roomId}`).emit("player_action")

    });

    socket.on("call", async ({roomId, id}) => {
        if (!roomId) return;
        var room = await Room.findById(roomId);
        if (!room) return;

        console.log(`User ${id} called`)
        
        for (let i = 0; i<room.players.length;i++){
            if(room.players[i]?.userId.toString()===id) {
                room.players[i]!.turn = false;
                room.players[i]!.current_action = "call"
                if (!room.players[i]!.currentBet) room.players[i]!.currentBet = 0;
                if (room.players[i]!.currentBet! > room.players[i]!.currentBalance) {
                    room.pot += room.players[i]!.currentBalance;
                    room.players[i]!.currentBet = room.players[i]!.currentBalance;
                    room.players[i]!.currentBalance = 0;
                } else {
                    room.players[i]!.currentBalance -= (room.currentRoundBet - room.players[i]!.currentBet!);
                    room.pot += (room.currentRoundBet - room.players[i]!.currentBet!);
                    room.players[i]!.currentBet = room.currentRoundBet;
                }
                
                room.players[(i+1)%room.players.length]!.turn = true;
                break;
            }
        }

        room.markModified("players");
        
        

        if (turnCount >= room.players.length) {
            turnCount = 1;
            room.rndCnt++
            await room.save();
            roundHandler(socket,roomId)
        } else {
            turnCount++;
        }

        
        await room.save();

        socket.emit("player_action");
        socket.in(`Room_${roomId}`).emit("player_action")

    });

    socket.on("bet/rise", async ({roomId,id,value}) => {
        if (!roomId) return;
        var room = await Room.findById(roomId);
        if (!room) return;

        console.log(`User ${id} rised/bet ${value}`)

        for (let i = 0; i<room.players.length;i++){
            if(room.players[i]?.userId.toString()===id) {
                if (value > room.players[i]!.currentBalance) value = room.players[i]!.currentBalance;
                room.players[i]!.turn = false;
                room.players[i]!.current_action = "bet/rise";
                if (!room.players[i]!.currentBet) room.players[i]!.currentBet = 0;
                room.currentRoundBet = value;
                room.players[i]!.currentBalance -= (value - room.players[i]!.currentBet!);
                room.pot += (room.currentRoundBet - room.players[i]!.currentBet!);
                room.players[i]!.currentBet = room.currentRoundBet;
                room.players[(i+1)%room.players.length]!.turn = true;
                break;
            }
        }
        
        room.markModified("players");
        await room.save();
        //start betting Round
        turnCount = 2;
        console.log(turnCount)
        socket.emit("player_action");
        socket.in(`Room_${roomId}`).emit("player_action")
    });
  
};

export default userActionsHandler;
