import mongoose from "mongoose";

const audioBookSchema = mongoose.Schema(
  {
    book_name: { type: String },
    category: { type: String },
    author_first_name: { type: String },
    author_id: { type: String },
    language: { type: String },
    book_cover_url: { type: String },
    description: { type: String },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createAt: "created_at",
      updateAt: "updated_at",
    },
  }
);

const AudioBook = mongoose.model("AudioBook", audioBookSchema);

export default AudioBook;
