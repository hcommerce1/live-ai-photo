import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface ScrapedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Validate protocol (only allow http and https)
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Invalid URL protocol. Only HTTP and HTTPS are allowed." },
        { status: 400 }
      );
    }

    // Fetch the page with timeout
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const images: ScrapedImage[] = [];
    const seenUrls = new Set<string>();

    // Find all images
    $("img").each((_, element) => {
      const img = $(element);
      let src = img.attr("src") || img.attr("data-src") || img.attr("data-lazy-src");

      if (!src) return;

      // Convert relative URLs to absolute
      try {
        src = new URL(src, url).href;
      } catch {
        return;
      }

      // Skip if already seen
      if (seenUrls.has(src)) return;
      seenUrls.add(src);

      // Skip small images (likely icons, logos, etc.)
      const width = parseInt(img.attr("width") || "0");
      const height = parseInt(img.attr("height") || "0");
      if ((width > 0 && width < 100) || (height > 0 && height < 100)) return;

      // Skip common non-product images
      const srcLower = src.toLowerCase();
      if (
        srcLower.includes("logo") ||
        srcLower.includes("icon") ||
        srcLower.includes("banner") ||
        srcLower.includes("avatar") ||
        srcLower.includes("sprite") ||
        srcLower.includes("placeholder") ||
        srcLower.includes("data:image") ||
        srcLower.includes(".svg") ||
        srcLower.includes(".gif")
      ) {
        return;
      }

      // Get alt text
      const alt = img.attr("alt") || img.attr("title") || "";

      images.push({
        url: src,
        alt,
        width: width || undefined,
        height: height || undefined,
      });
    });

    // Also look for images in picture elements
    $("picture source").each((_, element) => {
      const source = $(element);
      let srcset = source.attr("srcset");

      if (!srcset) return;

      // Get the first/largest image from srcset
      const srcParts = srcset.split(",");
      if (srcParts.length > 0) {
        let src = srcParts[srcParts.length - 1].trim().split(" ")[0];

        try {
          src = new URL(src, url).href;
        } catch {
          return;
        }

        if (seenUrls.has(src)) return;
        seenUrls.add(src);

        if (
          !src.toLowerCase().includes("logo") &&
          !src.toLowerCase().includes("icon") &&
          !src.toLowerCase().includes(".svg") &&
          !src.toLowerCase().includes(".gif")
        ) {
          images.push({
            url: src,
            alt: "",
          });
        }
      }
    });

    // Look for Open Graph images
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage && !seenUrls.has(ogImage)) {
      try {
        const absoluteOgImage = new URL(ogImage, url).href;
        images.unshift({
          url: absoluteOgImage,
          alt: $('meta[property="og:title"]').attr("content") || "",
        });
      } catch {
        // Ignore invalid URLs
      }
    }

    // Limit to first 20 images
    const limitedImages = images.slice(0, 20);

    return NextResponse.json({
      images: limitedImages,
      pageTitle: $("title").text() || $('meta[property="og:title"]').attr("content") || "",
      totalFound: images.length,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape images" },
      { status: 500 }
    );
  }
}
