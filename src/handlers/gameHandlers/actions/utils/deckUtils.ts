import cardSuits from "../../../../constants/cardSuits";
import cardValues from "../../../../constants/cardValues";
import Card from "../../../../interfaces/Card";
import _ from "lodash";
export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  cardSuits.forEach((suit) => {
    cardValues.forEach((value) => {
      deck.push({ suit, value });
    });
  });
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  return _.shuffle(deck);
};
