export async function getDirectPdfLink(
  url: string,
  options?: { notify?: boolean; label?: string }
): Promise<{ pdfLink: string | null; source: string | null; sourceName: string | null }> {
  const label = options?.label || url;

  try {
    const response = await fetch('http://localhost:8000/resolve-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      pdfLink: data.pdfLink,
      source: data.source,
      sourceName: data.sourceName
    };
  } catch (error) {
    console.error('PDF resolution failed:', error);
    return { pdfLink: null, source: null, sourceName: null };
  }
}