/** Draws the certificate SVG onto a canvas and saves (or shares) it as a PNG. */
export async function saveCertificate(svg: SVGSVGElement, fileName: string): Promise<void> {
  const text = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    await new Promise<void>((done, fail) => {
      img.onload = () => done();
      img.onerror = () => fail(new Error('Could not draw the certificate'));
      img.src = url;
    });
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = 600 * scale;
    canvas.height = 420 * scale;
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'));
    if (!blob) throw new Error('Could not save the certificate');

    // Phones: the share sheet (save to gallery, send on Messenger…). Elsewhere: a download.
    const file = new File([blob], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Englio certificate' }).catch(() => undefined);
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
