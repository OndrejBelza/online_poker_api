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

        let currentPlayers = room.players.filter(player=>player.current_action !== "fold");
        for (let i = 0; i<currentPlayers.length;i++){
            if(currentPlayers[i]?.userId.toString()===id) {
                currentPlayers[i]!.turn = false;
                currentPlayers[i]!.current_action = "fold"
                currentPlayers[(i+1)%currentPlayers.length]!.turn = true;
                break;
            }
        }
        room.players.map(player => {
            let plyr = currentPlayers.find(p=>p.userId.toString() === player.userId.toString())
            if (plyr){
                return plyr
            } else {
                return player
            }
        })

        room.markModified("players");
        

        if (turnCount >= currentPlayers.length) {
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

        let currentPlayers = room.players.filter(player=>player.current_action !== "fold");
        for (let i = 0; i<currentPlayers.length;i++){
            if(currentPlayers[i]?.userId.toString()===id) {
                currentPlayers[i]!.turn = false;
                currentPlayers[i]!.current_action = "check"
                currentPlayers[(i+1)%currentPlayers.length]!.turn = true;
                break;
            }
        }
        room.players.map(player => {
            let plyr = currentPlayers.find(p=>p.userId.toString() === player.userId.toString())
            if (plyr){
                return plyr
            } else {
                return player
            }
        })
        room.markModified("players");
        

        if (turnCount >= currentPlayers.length) {
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

        let currentPlayers = room.players.filter(player=>player.current_action !== "fold");
        for (let i = 0; i<currentPlayers.length;i++){
            if(currentPlayers[i]?.userId.toString()===id) {
                currentPlayers[i]!.turn = false;
                currentPlayers[i]!.current_action = "call"
                if (!currentPlayers[i]!.currentBet) currentPlayers[i]!.currentBet = 0;
                if (currentPlayers[i]!.currentBet! > currentPlayers[i]!.currentBalance) {
                    room.pot += currentPlayers[i]!.currentBalance;
                    currentPlayers[i]!.currentBet =currentPlayers[i]!.currentBalance;
                    currentPlayers[i]!.currentBalance = 0;
                } else {
                    currentPlayers[i]!.currentBalance -= (room.currentRoundBet - currentPlayers[i]!.currentBet!);
                    room.pot += (room.currentRoundBet - currentPlayers[i]!.currentBet!);
                    currentPlayers[i]!.currentBet = room.currentRoundBet;
                }
                
                currentPlayers[(i+1)%currentPlayers.length]!.turn = true;
                break;
            }
        }
        room.players.map(player => {
            let plyr = currentPlayers.find(p=>p.userId.toString() === player.userId.toString())
            if (plyr){
                return plyr
            } else {
                return player
            }
        })
        room.markModified("players");
        
        

        if (turnCount >= currentPlayers.length) {
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
        let currentPlayers = room.players.filter(player=>player.current_action !== "fold");
        for (let i = 0; i<currentPlayers.length;i++){
            if(currentPlayers[i]?.userId.toString()===id) {
                if (value > currentPlayers[i]!.currentBalance) value = currentPlayers[i]!.currentBalance;
                currentPlayers[i]!.turn = false;
                currentPlayers[i]!.current_action = "bet/rise";
                if (!currentPlayers[i]!.currentBet) currentPlayers[i]!.currentBet = 0;
                room.currentRoundBet = value;
                currentPlayers[i]!.currentBalance -= (value - currentPlayers[i]!.currentBet!);
                room.pot += (room.currentRoundBet - currentPlayers[i]!.currentBet!);
                currentPlayers[i]!.currentBet = room.currentRoundBet;
                currentPlayers[(i+1)%currentPlayers.length]!.turn = true;
                break;
            }
        }
        room.players.map(player => {
            let plyr = currentPlayers.find(p=>p.userId.toString() === player.userId.toString())
            if (plyr){
                return plyr
            } else {
                return player
            }
        })
        room.markModified("players");
        await room.save();
        //start betting Round
        turnCount = 2;

        socket.emit("player_action");
        socket.in(`Room_${roomId}`).emit("player_action")
    });
  
};

export default userActionsHandler;
