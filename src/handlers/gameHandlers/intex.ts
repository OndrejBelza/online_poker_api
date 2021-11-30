import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import createHandler from "./actions/create";
import joinHandler from "./actions/join";
import turnHandler from "./actions/turn";
import userActionsHandler from "./actions/userActions";

const gameHandler = (
  socket: Socket,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
) => {
  joinHandler(socket);
  turnHandler(socket);
  createHandler(socket);
  userActionsHandler(socket);
};

export default gameHandler;
