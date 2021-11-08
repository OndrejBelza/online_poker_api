import { Socket } from "socket.io";

const registrationHandler = (socket: Socket) => {
  socket.on("register", (args) => {
    // args are data from user
    console.log("registration data from user", args);

    // Registration logic goes here

    socket.emit("registration_result", true);
  });
};

export default registrationHandler;
