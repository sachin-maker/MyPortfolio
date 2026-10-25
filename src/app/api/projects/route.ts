
import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/app/lib/db";
import Project from "@/app/models/Project";
import { requireAdmin } from "@/app/lib/require-admin";


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

const projectSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().trim().min(1).max(2000),
    techStack: z
      .array(z.string().trim().min(1).max(50))
      .max(30)
      .default([]),
    image: z.string().trim().max(2048).default(""),
    liveUrl: optionalHttpsOrHttpUrl.default(""),
    githubUrl: optionalHttpsOrHttpUrl.default(""),
    featured: z.boolean().default(false),
    status: z.enum(["draft", "published"]).default("draft"),
    order: z.number().int().min(-100000).max(100000).default(0),
  })
  .strict();


const MAX_BODY_SIZE = 32 * 1024; // 32 KB

async function readLimitedBody(request: Request): Promise<string | null> {
  const contentLength = request.headers.get("content-length");

  if (contentLength !== null) {
    const size = Number(contentLength);

    if (!Number.isFinite(size) || size < 0 || size > MAX_BODY_SIZE) {
      throw new Error("REQUEST_BODY_TOO_LARGE");
    }
  }

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalSize += value.byteLength;

      if (totalSize > MAX_BODY_SIZE) {
        await reader.cancel();
        throw new Error("REQUEST_BODY_TOO_LARGE");
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalSize);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8", { fatal: true }).decode(body);
}



export async function GET() {
  try {
    await connectDB();

    const projects = await Project.find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);

    return NextResponse.json(
      { message: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();

  if (denied) {
    return denied;
  }

  try {
   let rawBody: string | null;

try {
  rawBody = await readLimitedBody(request);
} catch (error) {
  if (
    error instanceof Error &&
    error.message === "REQUEST_BODY_TOO_LARGE"
  ) {
    return NextResponse.json(
      { message: "Request body is too large" },
      { status: 413 }
    );
  }

  return NextResponse.json(
    { message: "Invalid request body" },
    { status: 400 }
  );
}

let body: unknown;

try {
  body = JSON.parse(rawBody ?? "");
} catch {
  return NextResponse.json(
    { message: "Invalid JSON body" },
    { status: 400 }
  );
}

const parsed = projectSchema.safeParse(body);

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

    const project = await Project.create(parsed.data);

    return NextResponse.json(project, { status: 201 });
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

    console.error("Failed to create project:", error);

    return NextResponse.json(
      { message: "Failed to create project" },
      { status: 500 }
    );
  }
}
