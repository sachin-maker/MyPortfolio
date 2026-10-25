
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/app/lib/db";
import Experience from "@/app/models/Experience";
import { requireAdmin } from "@/app/lib/require-admin";
import { readLimitedBody } from "@/app/lib/read-limited-body";

type RouteContext = {
    params: Promise<{ id: string }>;
};

const updateExperienceSchema = z.object({
    role: z.string().trim().min(1).max(120).optional(),
    company: z.string().trim().min(1).max(120).optional(),
    location: z.string().trim().max(160).optional(),
    employmentType: z.string().trim().max(80).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().nullable().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().trim().min(1).max(3000).optional(),
    isPublished: z.boolean().optional(),
    responsibilities: z
        .array(z.string().trim().min(1).max(500))
        .max(30)
        .optional(),
    techStack: z
        .array(z.string().trim().min(1).max(50))
        .max(30)
        .optional(),
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
    if (denied) return denied;

    try {
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { message: "Invalid experience ID" },
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

        const parsed = updateExperienceSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid experience data",
                    errors: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        await connectDB();

        const existing = await Experience.findById(id).lean();

        if (!existing) {
            return NextResponse.json(
                { message: "Experience not found" },
                { status: 404 }
            );
        }

        const updatedData = {
            isCurrent: existing.isCurrent,
            endDate: existing.endDate,
            ...parsed.data,
        };

        if (updatedData.isCurrent && updatedData.endDate) {
            return NextResponse.json(
                { message: "Current roles must not have an end date" },
                { status: 400 }
            );
        }

        const startDate = parsed.data.startDate ?? existing.startDate;

        if (updatedData.endDate && updatedData.endDate < startDate) {
            return NextResponse.json(
                { message: "End date cannot be earlier than start date" },
                { status: 400 }
            );
        }

        const experience = await Experience.findByIdAndUpdate(
            id,
            { $set: parsed.data },
            { new: true, runValidators: true }
        ).lean();

        return NextResponse.json(experience);
    } catch (error) {
        console.error("Failed to update experience:", error);

        return NextResponse.json(
            { message: "Failed to update experience" },
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
                { message: "Invalid experience ID" },
                { status: 400 }
            );
        }

        await connectDB();

        const experience = await Experience.findByIdAndDelete(id);

        if (!experience) {
            return NextResponse.json(
                { message: "Experience not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Experience deleted successfully",
        });
    } catch (error) {
        console.error("Failed to delete experience:", error);

        return NextResponse.json(
            { message: "Failed to delete experience" },
            { status: 500 }
        );
    }
}
