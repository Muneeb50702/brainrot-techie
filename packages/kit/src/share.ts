/** Render a DOM node (laid out off-screen at its final pixel size) to a PNG blob.
 *  html-to-image is loaded on demand, only when someone actually shares. */
export async function nodeToPng(node: HTMLElement, width: number, height: number): Promise<Blob> {
  const { toBlob } = await import("html-to-image");
  await document.fonts.ready;
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined))));
  const opts = { width, height, pixelRatio: 1, cacheBust: true };
  // First pass warms html-to-image's font/image cache. Safari often drops images on pass one.
  await toBlob(node, opts).catch(() => null);
  const blob = await toBlob(node, opts);
  if (!blob) throw new Error("render failed");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Native share sheet with the image when the device supports it, else download. */
export async function shareImage(blob: Blob, filename: string, text: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return "shared";
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return "shared";
    }
  }
  downloadBlob(blob, filename);
  return "downloaded";
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
