export async function fetchFileAsBuffer(fileUrl: string): Promise<Buffer> {
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch file from storage");
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}