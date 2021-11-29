import { Socket } from "socket.io";

const joinHandler = (socket: Socket) => {
  socket.on("join_game", async (id) => {
    console.log(`Room${id}`)
    // edit data in db
    //...
    // this adds user to room
    socket.join(`Room${id}`)
    socket.in(`Room${id}`).emit("user_has_joined", "New user {username} has joined");
    // socket.emit("join_result", {});
  });
  
};

export default joinHandler;
