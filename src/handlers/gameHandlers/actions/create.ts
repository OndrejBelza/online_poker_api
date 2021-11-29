import { Socket } from "socket.io";

const createHandler = (socket: Socket) => {
  socket.on("create_game", async (id) => {
    console.log(`Game created with id = ${id}`)
    // edit data in db
    //...
    // this adds user to room
    socket.join(`Room1`)
    socket.emit("game_data", {
        id: id,
        pot: 0,
        currentBet: 0,
        deck:
            [{
                value: "A",
                suit: "hearts"
            },{
                value: "5",
                suit: "clubs"
            },{
                value: "K",
                suit: "hearts"
            },{
                value: "6",
                suit: "spades"
            },{
                value: "6",
                suit: "diamonds"
            }]
        ,
        currentUser: "Gerardo",
        players: [{
            id: 1,
            position: 1,
            portrait: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            name: "Gerardo",
            skin: "default",
            hand: [{
                value: "A",
                suit: "spades"
            },{
                value: "A",
                suit: "clubs"
            }],
            chips: 100000,
            turn: true
        },{
            id: 2,
            position: 2,
            name: "Taichi",
            portrait: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            skin: "default",
            hand: [{
                value: null,
                suit: null
            },{
                value: null,
                suit: null
            }],
            chips: 200000,
            turn: false
        },{
            id: 3,
            position: 3,
            name: "Ondrej",
            portrait: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            skin: "default",
            hand: [{
                value: null,
                suit: null
            },{
                value: null,
                suit: null
            }],
            chips: 400000,
            turn: false
        }]
    });
    // socket.emit("join_result", {});
  });
  
};

export default createHandler;