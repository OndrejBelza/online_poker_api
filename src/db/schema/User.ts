import mongoose from "mongoose";

interface User {
  username: string;
  email: string;
  password: string;
};

export const userSchema = new mongoose.Schema<User>({
  username: String,
  email: String,
  password: String,
});

export const User = mongoose.model<User>("User", userSchema);