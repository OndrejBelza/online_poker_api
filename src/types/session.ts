import session from "express-session";

export type Session = {
  userId: string;
} & session.Session &
  Partial<session.SessionData>;
