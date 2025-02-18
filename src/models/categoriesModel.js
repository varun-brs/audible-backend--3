import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: { type: String },
    code: { type: String },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createAt: "created_at",
      updateAt: "updated_at",
    },
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
