import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

import { getUploadMaxBytes } from "./env";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function normaliseVictoriaImage(input: Buffer) {
  if (input.length > getUploadMaxBytes()) {
    throw new Error("File is too large");
  }

  const type = await fileTypeFromBuffer(input);
  if (!type || !allowedMimeTypes.has(type.mime)) {
    throw new Error("Unsupported image type");
  }

  const image = sharp(input, { failOn: "error" }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? null;
  const height = metadata.height ?? null;

  const output = await image
    .resize({
      width: 1800,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  return {
    buffer: output,
    mimeType: "image/webp",
    width,
    height,
    sizeBytes: output.length,
  };
}
