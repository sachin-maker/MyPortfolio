
import { NextResponse } from "next/server";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

import { requireAdmin } from "@/app/lib/require-admin";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 64 * 1024;
const MAX_PIXELS = 25_000_000;

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

async function readRequestBody(
  request: Request,
  maxBytes: number
): Promise<Buffer | null> {
  if (!request.body) return Buffer.alloc(0);

  const reader = request.body.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel();
        return null;
      }

      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks, totalBytes);
}

function uploadToCloudinary(
  buffer: Buffer,
  format: string
): Promise<{ secure_url: string }> {
  const cloudinaryClient = getCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinaryClient.uploader.upload_stream(
      {
        folder: "portfolio/projects",
        resource_type: "image",
        format,
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary returned no image URL."));
          return;
        }

        resolve({ secure_url: result.secure_url });
      }
    );

    stream.end(buffer);
  });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();

  if (denied) return denied;

  try {
    const contentType = request.headers
      .get("content-type")
      ?.toLowerCase();

    if (!contentType?.startsWith("multipart/form-data;")) {
      return NextResponse.json(
        { message: "Content-Type must be multipart/form-data." },
        { status: 415 }
      );
    }

    const contentLengthHeader = request.headers.get("content-length");

    if (contentLengthHeader !== null) {
      const contentLength = Number(contentLengthHeader);

      if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
        return NextResponse.json(
          { message: "Invalid Content-Length." },
          { status: 400 }
        );
      }

      if (contentLength > MAX_REQUEST_SIZE) {
        return NextResponse.json(
          { message: "Image must be 2 MB or smaller." },
          { status: 413 }
        );
      }
    }

    const bodyBuffer = await readRequestBody(
      request,
      MAX_REQUEST_SIZE
    );

    if (!bodyBuffer) {
      return NextResponse.json(
        { message: "Upload request is too large." },
        { status: 413 }
      );
    }

    const headers = new Headers(request.headers);
    headers.delete("content-length");

    const boundedRequest = new Request(request.url, {
      method: "POST",
      headers,
      body: new Uint8Array(bodyBuffer),
    });

    const formData = await boundedRequest.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Please select an image file." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Image must be greater than 0 bytes and no larger than 2 MB." },
        { status: 413 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const image = sharp(inputBuffer, {
      limitInputPixels: MAX_PIXELS,
      failOn: "error",
      animated: false,
    });

    const metadata = await image.metadata();

    if (
      !metadata.format ||
      !ALLOWED_FORMATS.has(metadata.format) ||
      !metadata.width ||
      !metadata.height ||
      metadata.width * metadata.height > MAX_PIXELS
    ) {
      return NextResponse.json(
        { message: "Only valid JPEG, PNG, and WebP images are allowed." },
        { status: 415 }
      );
    }

    const outputFormat = metadata.format;
    const outputBuffer = await image
      .rotate()
      .toFormat(outputFormat, {
        quality: outputFormat === "png" ? undefined : 85,
      })
      .toBuffer();

    if (outputBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Processed image exceeds the 2 MB limit." },
        { status: 413 }
      );
    }

    const result = await uploadToCloudinary(
      outputBuffer,
      outputFormat
    );

    return NextResponse.json(
      { url: result.secure_url },
      { status: 201 }
    );
  } catch (error) {
    console.error("Project image upload failed:", error);

    return NextResponse.json(
      { message: "Unable to upload image." },
      { status: 500 }
    );
  }
}
