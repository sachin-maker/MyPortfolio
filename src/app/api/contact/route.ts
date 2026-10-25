
import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const MAX_BODY_BYTES = 16_000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_RATE_LIMIT_ENTRIES = 5_000;

const contactSchema = z
    .object({
        name: z.string().trim().min(2).max(80),
        email: z.string().trim().email().max(254),
        subject: z.string().trim().min(3).max(120),
        message: z.string().trim().min(10).max(3000),

        // Accept a filled honeypot so it can be silently ignored.
        website: z.string().max(2048).optional().default(""),
    })
    .strict();

const requestLog = new Map<
    string,
    { count: number; resetAt: number }
>();

function getClientKey(request: Request): string {
    // Only trust this header when your hosting proxy overwrites it
    // with the actual client IP. Never trust arbitrary client values.
    const ip = request.headers.get("x-real-ip")?.trim();

    return ip && ip.length <= 80 ? ip : "unknown";
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return entities[char];
    });
}

function jsonError(message: string, status: number) {
    return NextResponse.json({ message }, { status });
}

function isRateLimited(key: string, now: number): boolean {
    // Remove expired entries to keep memory usage bounded.
    for (const [entryKey, entry] of requestLog) {
        if (entry.resetAt <= now) {
            requestLog.delete(entryKey);
        }
    }

    const record = requestLog.get(key);

    if (record && record.resetAt > now) {
        if (record.count >= MAX_REQUESTS) {
            return true;
        }

        record.count += 1;
        return false;
    }

    // Avoid unbounded memory growth if many distinct keys arrive.
    if (requestLog.size >= MAX_RATE_LIMIT_ENTRIES) {
        return true;
    }

    requestLog.set(key, {
        count: 1,
        resetAt: now + WINDOW_MS,
    });

    return false;
}

async function readBodyWithLimit(
    request: Request
): Promise<string | null> {
    const reader = request.body?.getReader();

    if (!reader) {
        return "";
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            totalBytes += value.byteLength;

            if (totalBytes > MAX_BODY_BYTES) {
                await reader.cancel();
                return null;
            }

            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }

    const body = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
    }

    return new TextDecoder("utf-8", { fatal: true }).decode(body);
}

export async function POST(request: Request) {
    const now = Date.now();
    const key = getClientKey(request);

    if (isRateLimited(key, now)) {
        return jsonError(
            "Too many submissions. Please try again later.",
            429
        );
    }

    try {
        const contentType = request.headers
            .get("content-type")
            ?.split(";")[0]
            .trim()
            .toLowerCase();

        if (contentType !== "application/json") {
            return jsonError(
                "Content-Type must be application/json.",
                415
            );
        }

        const contentLengthHeader = request.headers.get("content-length");

        if (contentLengthHeader !== null) {
            const contentLength = Number(contentLengthHeader);

            if (
                !Number.isSafeInteger(contentLength) ||
                contentLength < 0
            ) {
                return jsonError("Invalid Content-Length.", 400);
            }

            if (contentLength > MAX_BODY_BYTES) {
                return jsonError("Request body is too large.", 413);
            }
        }

        let rawBody: string | null;

        try {
            rawBody = await readBodyWithLimit(request);
        } catch {
            return jsonError("Invalid request body.", 400);
        }

        if (rawBody === null) {
            return jsonError("Request body is too large.", 413);
        }

        let body: unknown;

        try {
            body = JSON.parse(rawBody);
        } catch {
            return jsonError("Invalid JSON request body.", 400);
        }

        const parsed = contactSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Please check your contact form details.",
                    errors: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        // Return a generic success for bot submissions.
        if (parsed.data.website.trim().length > 0) {
            return NextResponse.json({
                message: "Your message has been received.",
            });
        }

        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.CONTACT_FROM_EMAIL;
        const to = process.env.CONTACT_TO_EMAIL;

        if (!apiKey || !from || !to) {
            console.error(
                "Contact email environment variables are missing."
            );

            return jsonError(
                "Email delivery is not configured yet.",
                503
            );
        }

        const resend = new Resend(apiKey);
        const { name, email, subject, message } = parsed.data;

        const { data, error: resendError } = await resend.emails.send({
            from,
            to: [to],
            replyTo: email,
            subject: `Portfolio contact: ${subject}`,
            text: [
                `Name: ${name}`,
                `Email: ${email}`,
                `Subject: ${subject}`,
                "",
                message,
            ].join("\n"),
            html: `
        <h2>New portfolio contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
        });

        if (resendError) {
            console.error(
                "Resend rejected the contact email:",
                resendError
            );

            return jsonError(
                "Unable to send your message right now. Please try again later.",
                502
            );
        }

        return NextResponse.json({
            message:
                "Your message has been accepted for email delivery. Thank you for reaching out!",
            id: data?.id,
        });
    } catch (error) {
        console.error("Contact request failed:", error);

        return jsonError(
            "Unable to process your request right now.",
            500
        );
    }
}
