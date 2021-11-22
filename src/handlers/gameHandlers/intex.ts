import { Socket } from "socket.io";
import joinHandler from "./actions/join";

const gameHandler = (socket: Socket) => {
  joinHandler(socket);
};

export default gameHandler;
