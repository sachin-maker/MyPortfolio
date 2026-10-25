
import "server-only";

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ExperienceSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    employmentType: {
      type: String,
      default: "",
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
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

ExperienceSchema.index({ isPublished: 1, order: 1 });

export type Experience = InferSchemaType<typeof ExperienceSchema>;

const ExperienceModel =
  mongoose.models.Experience ??
  mongoose.model("Experience", ExperienceSchema);

export default ExperienceModel;
