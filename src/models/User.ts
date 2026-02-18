import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: Date;
  role: "ADMIN" | "USER";
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true },
    image: { type: String },
    emailVerified: { type: Date },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  },
  { 
    timestamps: true,
    collection: "users" // Ensure it matches the Auth.js default collection
  }
);

const User: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
