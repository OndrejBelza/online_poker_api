import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import createHandler from "./actions/create";
import joinHandler from "./actions/join";
import leaveHandler from "./actions/leave";
import loadDataHandler from "./actions/loadData";
import startGameHandler from "./actions/startGame";
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
  startGameHandler(socket, io);
  loadDataHandler(socket);
  leaveHandler(socket);
};

export default gameHandler;
