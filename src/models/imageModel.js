import mongoose from "mongoose";

const imageSchema = mongoose.Schema(
  {
    path: { type: String, required: true },
    filename: { type: String, required: true },
  },
  {
    timestamps: {
      createAt: "created_at",
      updateAt: "updated_at",
    },
  }
);

const Image = mongoose.model("Image", imageSchema);

export default Image;
