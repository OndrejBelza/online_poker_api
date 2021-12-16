
import { Socket } from "socket.io";
import { Request } from "express";
import { Session } from "../../../types/session";
import { Room, User } from "../../../db/schema";
// @ts-ignore
import { Hand } from 'pokersolver';
import startGame from "./startGame";

const roundHandler = async (socket: Socket, id: String) => {
  try{
    var room;
    if (id) room = await Room.findById(id);

    // if room doesn't exist we will not join him to the game
    if (!room) return;

    const session = (socket.request as Request).session as Session;
    if (!session.userId) return;
    var user = await User.findById(session.userId);
    if (!user) return;

    switch (room.rndCnt) {
        case 0:
            room.players[0]!.turn = true;
            break;
        case 1:
            for (let i=0;i<3;i++){
                var card = room.deck.shift();
                if (!card) break;
                room.cardsOnTable.push(card);
                room.currentRoundBet= 0;
            }
            for (let player of room.players) {
                player.currentBet = 0;
                if (player.current_action != "fold") player.current_action = null;
            }
            break;
        case 2:
            var card = room.deck.shift();
            if (!card) break;
            room.cardsOnTable.push(card);
            room.currentRoundBet= 0;
            for (let player of room.players) {
                player.currentBet = 0;
                if (player.current_action != "fold") player.current_action = null;
            }
            break;
        case 3:
            var card = room.deck.shift();
            if (!card) break;
            room.cardsOnTable.push(card);
            room.currentRoundBet= 0;
            for (let player of room.players) {
                player.currentBet = 0;
                if (player.current_action != "fold") player.current_action = null;
            }
            break;    
        case 4:
            let finalHands = [];
            let ids = [];
            let newCardsOnTable = [];
            for (let card of room.cardsOnTable){
                if (card.value === "10") card.value = "T"
                newCardsOnTable.push(card.value + card.suit.charAt(0))
            }
            for (let i = 0;i<room.players.length;i++) {


                let newCards = [];
                
                if (room.players[i]?.current_action !== "fold"){
                    for (let card of room.players[i]?.currentHand!) {
                        if (card.value === "10") card.value = "T"
                        newCards.push(card.value + card.suit.charAt(0))
                    }
                    ids.push(room.players[i]?.userId)
                    let hand = Hand.solve([...newCards,...newCardsOnTable])
                    hand.userId = room.players[i]?.userId;
                    hand.username = room.players[i]?.username;
                    finalHands.push(hand);
                }
            } 
            const winner = Hand.winners(finalHands);

            console.log(winner[0].name,winner[0].descr,winner[0].userId)

            for (let player of room.players) {
                if (player.userId.toString()===winner[0].userId.toString()){
                    player.currentBalance += room.pot
                    user.balance += room.pot ;
                }
            }
            let winningCards = []
            
            for (let card of winner[0].cards) {
                let suit = "";
                switch (card.suit){
                    case "c":
                        suit = "clubs";
                        break;
                    case "d":
                        suit = "diamonds";
                        break;
                    case "h":
                        suit = "hearts";
                        break;
                    case "s":
                        suit = "spades";
                        break;
                }
                let value = "";
                card.value === "T" ? value = "10" : value = card.value
                winningCards.push({
                    value:value,
                    suit:suit
                })
            }
            
            const gameWinner = {
                username: winner[0].username,
                hand: winningCards,
                description: winner[0].descr,
            }

            socket.emit("winner", gameWinner);
            socket.in(`Room_${id}`).emit("winner", gameWinner)
            room.rndCnt = 0;
            room.gameState = "WAITING";
            room.pot = 0;
            room.deck = [];
            room.cardsOnTable = [];
            room.currentRoundBet = 0;
            for (let player of room.players) {
                player.turn = false;
                player.current_action = null;
                player.currentBet = undefined;
                player.currentHand = undefined;
            }
            setTimeout(()=>{
                startGame(socket,id)
            },3000)
            break;
        default:
            break;
    }

    room.markModified("players");
    await user.save();
    await room.save();
    socket.emit("round_started")
    socket.in(`Room_${id}`).emit("round_started")

  } catch (err) {
      console.log(err)
  }
};

export default roundHandler;