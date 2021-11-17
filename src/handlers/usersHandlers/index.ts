import { Socket } from "socket.io";
import meHandler from "./actions/me";

const usersHandler = (socket: Socket) => {
  meHandler(socket);
};

export default usersHandler;
