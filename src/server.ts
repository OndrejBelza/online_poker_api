import MongoStore from "connect-mongo";
import cors from "cors";
import "dotenv-safe/config";
import express, { Request } from "express";
import session from "express-session";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import COOKIE_NAME from "./constants/cookieName";
import corsSettings from "./constants/corsSetting";
import __prod__ from "./constants/prod";
import usersHandler from "./handlers/usersHandlers";
import router from "./routes/router";
import bodyParser from "body-parser";
import { Session } from "./types/session";
import gameHandler from "./handlers/gameHandlers";
const port = process.env.PORT;

const main = async () => {
  const app = express();

  app.set("trust-proxy", 1);

  app.use(bodyParser.json());

  // This will allow cors from our app
  app.use(cors(corsSettings));

  // we have to create server so clients can connect to it
  const server = http.createServer(app);

  // connection to mongodb
  await mongoose.connect(process.env.MONGO_URL as string);

  // creating session middleware
  const sessionMiddleware = session({
    name: COOKIE_NAME,
    secret: process.env.SESSION_SECRET as string,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
      httpOnly: true,
      sameSite: "lax",
      secure: __prod__,
      domain: __prod__ ? process.env.APP_URL : "",
    },
  });

  // setting up cookies
  app.use(sessionMiddleware);

  // add routes for express
  app.use(router);

  // creates new instance of socket.io
  const io = new Server(server, {
    cors: corsSettings,
  });

  const wrap = (middleware: any) => (socket: any, next: any) =>
    middleware(socket.request, {}, next);

  io.use(wrap(sessionMiddleware));

  // listens to connection from clients
  io.on("connection", (socket) => {
    // access to session
    const session = (socket.request as Request).session as Session;
    console.log("userId", session.userId);

    console.log("a user connected");

    // handles all requests from user about users i.e. registration, login...
    usersHandler(socket);

    // game handler
    gameHandler(socket, io);

    // this function will be triggered when user will close connection
    socket.on("disconnect", () => {
      console.log("a user has disconnected");
    });
  });

  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
};

main().catch(console.error);
