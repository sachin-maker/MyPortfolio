
import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/app/lib/db";
import Education from "@/app/models/Education";
import { requireAdmin } from "@/app/lib/require-admin";
import { readLimitedBody } from "@/app/lib/read-limited-body";

const educationSchema = z.object({
    qualification: z.string().trim().min(1).max(160),
    institution: z.string().trim().min(1).max(160),
    fieldOfStudy: z.string().trim().max(160).optional(),
    location: z.string().trim().max(160).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable().optional(),
    isCurrent: z.boolean().optional(),
    grade: z.string().trim().max(80).optional(),
    description: z.string().trim().max(2000).optional(),
    order: z.number().int().min(-100000).max(100000).optional(),
    isPublished: z.boolean().optional(),
}).strict();

export async function GET() {
    try {
        await connectDB();

        const education = await Education.find({
            isPublished: true,
        })
            .sort({ order: 1, startDate: -1 })
            .lean();

        return NextResponse.json(education);
    } catch (error) {
        console.error("Failed to fetch education:", error);

        return NextResponse.json(
            { message: "Failed to fetch education" },
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

        const parsed = educationSchema.safeParse(body);


        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid education data",
                    errors: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        if (parsed.data.isCurrent && parsed.data.endDate) {
            return NextResponse.json(
                { message: "Current education must not have an end date" },
                { status: 400 }
            );
        }

        if (
            parsed.data.endDate &&
            parsed.data.endDate < parsed.data.startDate
        ) {
            return NextResponse.json(
                { message: "End date cannot be earlier than start date" },
                { status: 400 }
            );
        }

        await connectDB();

        const education = await Education.create(parsed.data);

        return NextResponse.json(education, { status: 201 });
    } catch (error) {
        console.error("Failed to create education:", error);

        return NextResponse.json(
            { message: "Failed to create education" },
            { status: 500 }
        );
    }
}
