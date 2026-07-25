// imageCompress.ts — resizes and compresses images in the browser before upload
// Keeps uploads small (both for the user's data plan and our R2 storage costs).

const MAX_DIMENSION = 1600; // longest side, in pixels
const JPEG_QUALITY = 0.82;

export async function compressImage(file: File): Promise<Blob> {
  // Skip compression for already-small files or GIFs (animated GIFs would
  // lose their animation if we ran them through canvas)
  if (file.type === 'image/gif' || file.size < 150 * 1024) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      height = Math.round((height / width) * MAX_DIMENSION);
      width = MAX_DIMENSION;
    } else {
      width = Math.round((width / height) * MAX_DIMENSION);
      height = MAX_DIMENSION;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file; // fallback — canvas unsupported, just upload original

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || file),
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
