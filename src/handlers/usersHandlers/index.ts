import { Socket } from "socket.io";
import registrationHandler from "./actions/registration";

const usersHandler = (socket: Socket) => {
  registrationHandler(socket);
};

export default usersHandler;
