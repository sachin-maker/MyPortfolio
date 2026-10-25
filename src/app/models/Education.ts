
import "server-only";

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const EducationSchema = new Schema(
  {
    qualification: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    fieldOfStudy: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
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
    grade: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000,
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

EducationSchema.index({ isPublished: 1, order: 1 });

export type Education = InferSchemaType<typeof EducationSchema>;

const EducationModel =
  mongoose.models.Education ??
  mongoose.model("Education", EducationSchema);

export default EducationModel;
