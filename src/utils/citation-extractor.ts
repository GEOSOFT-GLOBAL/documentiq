import { type Citation, type SourceType, type CitationStyle, formatManualCitation } from "./citation-formatter";

// Extract metadata from document content
export const extractMetadataFromDocument = (
  content: string,
  filename: string
): Partial<Citation> => {
  // Extract title from filename
  const title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

  // Extract year from content or filename
  const yearMatch = content.match(/\b(19|20)\d{2}\b/) || filename.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

  // Extract author from content
  let authors = "";
  const authorPatterns = [
    /(?:by|author[s]?:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:written by|©)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  ];
  for (const pattern of authorPatterns) {
    const match = content.match(pattern);
    if (match) {
      authors = match[1];
      break;
    }
  }
  if (!authors) authors = "[Author]";

  // Extract DOI
  const doiMatch = content.match(/10\.\d{4,}\/[^\s]+/);
  const doi = doiMatch ? doiMatch[0] : "";

  // Extract ISBN
  const isbnMatch = content.match(/ISBN[:\s]*([0-9-X]+)/i);
  const isbn = isbnMatch ? isbnMatch[1] : "";
  console.log(isbn)

  // Extract publisher
  const publisherMatch = content.match(
    /(?:publisher|published by|press|publishing)[:\s]*([A-Z][a-zA-Z\s]+)/i
  );
  const publisher = publisherMatch ? publisherMatch[1]?.trim() : "";

  return {
    authors,
    title,
    year,
    doi,
    publisher,
  };
};

// Detect source type from content/filename
export const detectSourceType = (content: string, filename: string): SourceType => {
  const lowerContent = content.toLowerCase();
  const lowerFilename = filename.toLowerCase();

  if (lowerFilename.includes("article") || lowerContent.includes("journal") || lowerContent.includes("doi:")) {
    return "journal";
  }
  if (lowerContent.includes("http") || lowerContent.includes("www.")) {
    return "website";
  }
  return "book";
};

// Generate manual citation from document
export const generateCitationFromDocument = (
  content: string,
  filename: string,
  style: CitationStyle
): string => {
  const metadata = extractMetadataFromDocument(content, filename);
  const sourceType = detectSourceType(content, filename);
  return formatManualCitation(metadata, sourceType, style);
};

// Extract metadata from URL
export const extractMetadataFromURL = (urlString: string): Partial<Citation> & { sourceType: SourceType } => {
  try {
    const url = new URL(urlString);

    // Extract website name from hostname
    const websiteName = url.hostname.replace(/^www\./, "").split(".")[0];
    const capitalizedWebsiteName = websiteName.charAt(0).toUpperCase() + websiteName.slice(1);

    // Extract title from pathname
    const pathParts = url.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1] || "";
    const title =
      lastPart
        .replace(/[-_]/g, " ")
        .replace(/\.[^/.]+$/, "")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") || capitalizedWebsiteName;

    // Determine source type
    let sourceType: SourceType = "website";
    if (url.hostname.includes("youtube") || url.hostname.includes("vimeo")) {
      sourceType = "video";
    }

    // Get current date for access date
    const today = new Date();
    const accessDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      sourceType,
      authors: "[Author/Organization]",
      title: title || "[Page Title]",
      year: new Date().getFullYear().toString(),
      websiteName: capitalizedWebsiteName,
      url: urlString,
      accessDate,
      channelName: sourceType === "video" ? capitalizedWebsiteName : "",
      videoUrl: sourceType === "video" ? urlString : "",
    };
  } catch {
    // Invalid URL, return basic data
    return {
      sourceType: "website",
      authors: "[Author]",
      title: "[Page Title]",
      year: new Date().getFullYear().toString(),
      websiteName: "[Website]",
      url: urlString,
      accessDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }
};

// Generate manual citation from URL
export const generateCitationFromURL = (urlString: string, style: CitationStyle): string => {
  const { sourceType, ...metadata } = extractMetadataFromURL(urlString);
  return formatManualCitation(metadata, sourceType, style);
};

// Log file metadata for debugging
export const logFileMetadata = (file: File, content?: string): void => {
  console.log("=== FILE METADATA ===");
  console.log("Name:", file.name);
  console.log("Type (MIME):", file.type);
  console.log("Size (KB):", (file.size / 1024).toFixed(2));
  console.log("Last Modified:", new Date(file.lastModified).toISOString());

  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
  console.log("Extension:", fileExtension);
  console.log("Name without extension:", fileNameWithoutExt);

  const yearMatch = file.name.match(/\b(19|20)\d{2}\b/);
  console.log("Year in filename:", yearMatch ? yearMatch[0] : "None");

  if (content) {
    console.log("=== CONTENT METADATA ===");
    console.log("Content length:", content.length);
    console.log("First 500 chars:", content.slice(0, 500));
    console.log("Line count:", content.split("\n").length);

    const contentYearMatch = content.match(/\b(19|20)\d{2}\b/);
    console.log("Year in content:", contentYearMatch ? contentYearMatch[0] : "None");

    const authorMatch = content.match(/(?:by|author[s]?:?|written by|©)\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/i);
    console.log("Author found:", authorMatch ? authorMatch[1] : "None");

    const doiMatch = content.match(/10\.\d{4,}\/[^\s]+/);
    console.log("DOI found:", doiMatch ? doiMatch[0] : "None");
  }

  console.log("=== END METADATA ===");
};
