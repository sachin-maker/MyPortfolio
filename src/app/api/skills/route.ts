
import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/app/lib/db";
import Skill from "@/app/models/Skill";
import { requireAdmin } from "@/app/lib/require-admin";
import { readLimitedBody } from "@/app/lib/read-limited-body";

const skillSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(80),
  proficiency: z.number().min(0).max(100).nullable().optional(),
  icon: z.string().trim().max(100).optional(),
  order: z.number().int().min(-100000).max(100000).optional(),
  isActive: z.boolean().optional(),
}).strict();

export async function GET() {
  try {
    await connectDB();

    const skills = await Skill.find({ isActive: true })
      .sort({ category: 1, order: 1, name: 1 })
      .lean();

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Failed to fetch skills:", error);

    return NextResponse.json(
      { message: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();

  if (denied) return denied;

  try {
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

const parsed = skillSchema.safeParse(body);

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

    const skill = await Skill.create(parsed.data);

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Failed to create skill:", error);

    return NextResponse.json(
      { message: "Failed to create skill" },
      { status: 500 }
    );
  }
}
