import express from "express";
import "dotenv-safe/config";
import cors from "cors";
import { Server } from "socket.io";
import corsSettings from "./constants/corsSetting";
import usersHandler from "./handlers/usersHandlers";
import mongoose from "mongoose";

const port = process.env.PORT;

const main = async () => {
  const app = express();

  // This will allow cors from our app
  app.use(cors(corsSettings));

  // we have to create server so clients can connect to it
  const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });

  await mongoose.connect(process.env.MONGO_URL as string);

  // creates new instance of socket.io
  const io = new Server(server, {
    cors: corsSettings,
  });

  // listens to connection from clients
  io.on("connection", (socket) => {
    // handles all requests from user about users i.e. registration, login...
    usersHandler(socket);

    socket.on("disconnect", () => {
      console.log("a user has disconnected");
    });
    console.log("a user connected");
  });
};

main().catch(console.error);
