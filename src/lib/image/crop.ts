export type NormalizedBoundingBox = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
};

const CROP_MARGIN = 0.04;

export async function cropImageToBoundingBox(
  file: File,
  box: NormalizedBoundingBox | null,
): Promise<File> {
  if (!box) {
    return file;
  }

  const bitmap = await createImageBitmap(file);

  const width = bitmap.width;
  const height = bitmap.height;

  const marginX = (box.xMax - box.xMin) * CROP_MARGIN;
  const marginY = (box.yMax - box.yMin) * CROP_MARGIN;

  const xMin = Math.max(0, box.xMin - marginX);
  const yMin = Math.max(0, box.yMin - marginY);
  const xMax = Math.min(1, box.xMax + marginX);
  const yMax = Math.min(1, box.yMax + marginY);

  const sx = Math.round(xMin * width);
  const sy = Math.round(yMin * height);
  const sWidth = Math.max(1, Math.round((xMax - xMin) * width));
  const sHeight = Math.max(1, Math.round((yMax - yMin) * height));

  const canvas = document.createElement("canvas");
  canvas.width = sWidth;
  canvas.height = sHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(
    bitmap,
    sx,
    sy,
    sWidth,
    sHeight,
    0,
    0,
    sWidth,
    sHeight,
  );

  bitmap.close();

  const outputType =
    file.type === "image/png" || file.type === "image/webp"
      ? file.type
      : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, 0.92);
  });

  if (!blob) {
    return file;
  }

  const extension = outputType.split("/")[1];

  return new File(
    [blob],
    `cropped-garment.${extension}`,
    { type: outputType },
  );
}
