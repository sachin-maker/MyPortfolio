
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/app/lib/db";
import Skill from "@/app/models/Skill";
import { requireAdmin } from "@/app/lib/require-admin";
import { readLimitedBody } from "@/app/lib/read-limited-body";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateSkillSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  proficiency: z.number().min(0).max(100).nullable().optional(),
  icon: z.string().trim().max(100).optional(),
order: z.number().int().min(-100000).max(100000).optional(),
  isActive: z.boolean().optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
);

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid skill ID" },
        { status: 400 }
      );
    }


let rawBody: string;

try {
  rawBody = await readLimitedBody(request);
} catch (error) {
  const tooLarge =
    error instanceof Error &&
    error.message === "REQUEST_BODY_TOO_LARGE";

  return NextResponse.json(
    {
      message: tooLarge
        ? "Request body is too large"
        : "Invalid request body",
    },
    { status: tooLarge ? 413 : 400 }
  );
}

let body: unknown;

try {
  body = JSON.parse(rawBody);
} catch {
  return NextResponse.json(
    { message: "Invalid JSON body" },
    { status: 400 }
  );
}

const parsed = updateSkillSchema.safeParse(body);


    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid skill data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    await connectDB();

    const skill = await Skill.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!skill) {
      return NextResponse.json(
        { message: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(skill);
  } catch (error) {
    console.error("Failed to update skill:", error);

    return NextResponse.json(
      { message: "Failed to update skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid skill ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return NextResponse.json(
        { message: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete skill:", error);

    return NextResponse.json(
      { message: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
