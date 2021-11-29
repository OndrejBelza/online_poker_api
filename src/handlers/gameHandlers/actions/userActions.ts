import { Socket } from "socket.io";


//Example table data
let data = {
  id: "1",
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
}

function pass(id:number){
    for (let i = 0; i<data.players.length;i++){
        if(data.players[i]?.id===id) {
             data.players[i]!.turn = false;
             data.players[(i+1)%data.players.length]!.turn = true;
             break;
        }
     }
    return "Player" + id + "finished his turn"
}

const userActionsHandler = (socket: Socket) => {

    //Fold
    socket.on("fold", async (id) => {
        console.log(`User ${id} folded`)
        await pass(id);
        //Remove player from hand
        const newplayers =  await data.players.filter((player)=>player.id!==id);
        const newData = {
            ...data,
            players: newplayers
        }
        
        console.log(newData.players)
        socket.emit("game_data", newData);

    });
    //check
    socket.on("check", async (id) => {
        console.log(`User ${id} checked`)
        
        //Pass turn
        pass(id)

        console.log(data.players)
        socket.emit("game_data", data);

    });

    socket.on("call", async (id) => {
        console.log(`User ${id} called`)

        //Pass turn
        pass(id)

        //Bet same amount as currentBet
        const newplayers = data.players.map((player)=>{
            if (player.id===id) {
                player.chips -= data.currentBet,
                data.pot += data.currentBet
            }
            return player;
        });
        const newData = {
            ...data,
            players: newplayers
        }
        console.log(newData.players)
        socket.emit("game_data", newData);

    });

    socket.on("bet/rise", async ({id,value}) => {
        console.log(`User ${id} rised/bet ${value}`)
        //Pass turn
        pass(id)

        //Bet or Rise
        const newplayers = data.players.map((player)=>{
            if (player.id===id) {
                data.pot += (value - data.currentBet)
                data.currentBet = value
                player.chips -= value
            }
            return player;
        });
        const newData = {
            ...data,
            players: newplayers
        }
        console.log(newData.players)
        socket.emit("game_data", newData);

    });
  
};

export default userActionsHandler;
