import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: Date;
  role: "ADMIN" | "USER";
  billingInfo?: {
    type: "personal" | "company";
    name: string;
    taxNumber?: string;
    country: string;
    city: string;
    zip: string;
    street: string;
  };
  shippingAddress?: {
    name: string;
    country: string;
    city: string;
    zip: string;
    street: string;
    comment?: string;
  };
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true },
    image: { type: String },
    emailVerified: { type: Date },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    billingInfo: {
      type: { type: String, enum: ["personal", "company"] },
      name: { type: String },
      taxNumber: { type: String },
      country: { type: String },
      city: { type: String },
      zip: { type: String },
      street: { type: String },
    },
    shippingAddress: {
      name: { type: String },
      country: { type: String },
      city: { type: String },
      zip: { type: String },
      street: { type: String },
      comment: { type: String },
    },
  },
  { 
    timestamps: true,
    collection: "users" // Ensure it matches the Auth.js default collection
  }
);

const User: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
