export const findFirstPosition = (users: { position: number }[]) => {
  const max_players = 8;
  for (let index = 1; index <= max_players; index++) {
    if (users.every((u) => u.position !== index)) return index;
  }
  throw new Error("room is full");
};
