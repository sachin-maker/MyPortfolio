
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/app/lib/db";
import Project from "@/app/models/Project";
import { requireAdmin } from "@/app/lib/require-admin";
import { readLimitedBody } from "@/app/lib/read-limited-body";

type RouteContext = {
  params: Promise<{ id: string }>;
};


const optionalHttpsOrHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => {
      if (value === "") return true;

      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Enter a valid HTTP or HTTPS URL" }
  );

const updateProjectSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    techStack: z
      .array(z.string().trim().min(1).max(50))
      .max(30)
      .optional(),
    image: z.string().trim().max(2048).optional(),
    liveUrl: optionalHttpsOrHttpUrl.optional(),
    githubUrl: optionalHttpsOrHttpUrl.optional(),
    featured: z.boolean().optional(),
    status: z.enum(["draft", "published"]).optional(),
    order: z.number().int().min(-100000).max(100000).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });


export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const denied = await requireAdmin();

  if (denied) {
    return denied;
  }

  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid project ID" },
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

const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid project data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "A project with this slug already exists" },
        { status: 409 }
      );
    }

    console.error("Failed to update project:", error);

    return NextResponse.json(
      { message: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  const denied = await requireAdmin();

  if (denied) {
    return denied;
  }

  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid project ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete project:", error);

    return NextResponse.json(
      { message: "Failed to delete project" },
      { status: 500 }
    );
  }
}
