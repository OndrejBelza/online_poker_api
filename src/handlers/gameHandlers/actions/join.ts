import { Socket } from "socket.io";

const joinHandler = (socket: Socket) => {
  socket.on("join_game", async () => {
    // edit data in db
    //...
    // this adds user to room
    socket.join("room id");

    socket
      .to("room id")
      .emit("user_has_joined", "New user {username} has joined");

    socket.emit("join_result", {});
  });
};

export default joinHandler;
