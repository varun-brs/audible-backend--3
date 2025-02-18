import mongoose from "mongoose";

const filterAPISchema = mongoose.Schema(
  {
    userId: { type: Number },
    language: { type: String },
    title: { type: String },
    body: { type: String },
    id: { type: Number },
  },
  {
    timestamps: {
      createAt: "created_at",
      updateAt: "updated_at",
    },
  }
);

const Filter = mongoose.model("Filter", filterAPISchema);

export default Filter;
