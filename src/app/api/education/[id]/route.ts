
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import connectDB from "@/app/lib/db";
import Education from "@/app/models/Education";
import { requireAdmin } from "@/app/lib/require-admin";
import { readLimitedBody } from "@/app/lib/read-limited-body";

type RouteContext = {
    params: Promise<{ id: string }>;
};

const updateEducationSchema = z.object({
    qualification: z.string().trim().min(1).max(160).optional(),
    institution: z.string().trim().min(1).max(160).optional(),
    fieldOfStudy: z.string().trim().max(160).optional(),
    location: z.string().trim().max(160).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().nullable().optional(),
    isCurrent: z.boolean().optional(),
    grade: z.string().trim().max(80).optional(),
    description: z.string().trim().max(2000).optional(),
    order: z.number().int().min(-100000).max(100000).optional(),
    isPublished: z.boolean().optional(),
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
                { message: "Invalid education ID" },
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

        const parsed = updateEducationSchema.safeParse(body);


        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid education data",
                    errors: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        await connectDB();

        const existing = await Education.findById(id).lean();

        if (!existing) {
            return NextResponse.json(
                { message: "Education not found" },
                { status: 404 }
            );
        }

        const nextIsCurrent =
            parsed.data.isCurrent ?? existing.isCurrent;
        const nextEndDate =
            parsed.data.endDate !== undefined
                ? parsed.data.endDate
                : existing.endDate;

        if (nextIsCurrent && nextEndDate) {
            return NextResponse.json(
                { message: "Current education must not have an end date" },
                { status: 400 }
            );
        }

        const nextStartDate =
            parsed.data.startDate ?? existing.startDate;

        if (nextEndDate && nextEndDate < nextStartDate) {
            return NextResponse.json(
                { message: "End date cannot be earlier than start date" },
                { status: 400 }
            );
        }

        const education = await Education.findByIdAndUpdate(
            id,
            { $set: parsed.data },
            { new: true, runValidators: true }
        ).lean();

        return NextResponse.json(education);
    } catch (error) {
        console.error("Failed to update education:", error);

        return NextResponse.json(
            { message: "Failed to update education" },
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
                { message: "Invalid education ID" },
                { status: 400 }
            );
        }

        await connectDB();

        const education = await Education.findByIdAndDelete(id);

        if (!education) {
            return NextResponse.json(
                { message: "Education not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Education deleted successfully",
        });
    } catch (error) {
        console.error("Failed to delete education:", error);

        return NextResponse.json(
            { message: "Failed to delete education" },
            { status: 500 }
        );
    }
}
