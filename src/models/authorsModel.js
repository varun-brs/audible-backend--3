import mongoose from "mongoose";

const authorSchema = mongoose.Schema(
  {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    password: { type: String },
    published_audio_books: { type: Array, default: [] }, // Add default value for published_audio_books
    status: { type: Boolean, default: true },
    token: { type: String },
    verified: { type: Boolean, default: false },
    verify_token: { type: String },
    verify_token_expires: Date,
    reset_password_token: { type: String },
    reset_password_expires: Date,
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createAt: "created_at",
      updateAt: "updated_at",
    },
  }
);

const Author = mongoose.model("Author", authorSchema);

export default Author;
