
import "server-only";

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const SkillSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

SkillSchema.index({ category: 1, order: 1 });

export type Skill = InferSchemaType<typeof SkillSchema>;

const SkillModel =
  mongoose.models.Skill ??
  mongoose.model("Skill", SkillSchema);

export default SkillModel;
