import { Socket } from "socket.io";
import createHandler from "./actions/create";
import joinHandler from "./actions/join";
import turnHandler from "./actions/turn";
import userActionsHandler from "./actions/userActions";

const gameHandler = (socket: Socket) => {
  joinHandler(socket);
  turnHandler(socket);
  createHandler(socket);
  userActionsHandler(socket)
};

export default gameHandler;
