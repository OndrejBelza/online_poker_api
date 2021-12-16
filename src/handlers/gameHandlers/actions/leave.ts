import { Request } from "express";
import { Socket } from "socket.io";
import { Room, User } from "../../../db/schema";
import { Session } from "../../../types/session";

const leaveHandler = (socket: Socket) => {
    socket.on("leave_table",async (id)=>{
        const session = (socket.request as Request).session as Session;
    
        // if user is not logged in we will not join him to the game
        if (!session.userId) return;
    
        const user = await User.findById(session.userId);
    
        // if user doesn't exist we will not join him to the game
        if (!user) return;
    
        var room;
    
        console.log(`User ${session.userId} is leaving room Room_${id}`);
    
        room = await Room.findById(id);
    
        if (room) {
          room.players = room.players.filter(player => player.userId.toString() !== user._id.toString());
        } else {
          return
        }
        room.markModified("players");
        await room.save();
    
        socket
          .in(`Room_${id}`)
          .emit("user_has_left", `${user.username} has left the room`);
    
        socket.leave(`Room_${id}`);
    
    })
}

export default leaveHandler;