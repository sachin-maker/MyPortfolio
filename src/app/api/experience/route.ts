
import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/app/lib/db";
import Experience from "@/app/models/Experience";
import { requireAdmin } from "@/app/lib/require-admin";
import { readLimitedBody } from "@/app/lib/read-limited-body";

const experienceSchema = z.object({
    role: z.string().trim().min(1).max(120),
    company: z.string().trim().min(1).max(120),
    location: z.string().trim().max(160).optional(),
    employmentType: z.string().trim().max(80).optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().trim().min(1).max(3000),
    isPublished: z.boolean().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable().optional(),
    responsibilities: z
        .array(z.string().trim().min(1).max(500))
        .max(30)
        .optional(),
    techStack: z
        .array(z.string().trim().min(1).max(50))
        .max(30)
        .optional(),
    order: z.number().int().min(-100000).max(100000).optional(),
}).strict();


export async function GET() {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        await connectDB();

        const experiences = await Experience.find({})
            .sort({ order: 1, startDate: -1 })
            .lean();

        return NextResponse.json(experiences);
    } catch (error) {
        console.error("Failed to fetch experience:", error);

        return NextResponse.json(
            { message: "Failed to fetch experience" },
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

        const parsed = experienceSchema.safeParse(body);


        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid experience data",
                    errors: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const data = parsed.data;
        if (data.isCurrent && data.endDate) {
            return NextResponse.json(
                { message: "Current roles must not have an end date" },
                { status: 400 }
            );
        }

        if (data.endDate && data.endDate < data.startDate) {
            return NextResponse.json(
                { message: "End date cannot be earlier than start date" },
                { status: 400 }
            );
        }

        await connectDB();

        const experience = await Experience.create(data);

        return NextResponse.json(experience, { status: 201 });
    } catch (error) {
        console.error("Failed to create experience:", error);

        return NextResponse.json(
            { message: "Failed to create experience" },
            { status: 500 }
        );
    }
}
