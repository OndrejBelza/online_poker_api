import { Socket } from "socket.io";


// Not using this, you can remove

const turnHandler = (socket: Socket) => {
  socket.on("turn", async (id) => {
    console.log(`User ${id} turn`)
    // edit data in db
    //...
    // this adds user to room
    // socket.join(`Room${id}`)
    socket.emit("message", "message");
    // socket.emit("join_result", {});
  });
  
};

export default turnHandler;
