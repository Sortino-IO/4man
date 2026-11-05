import { readFileSync } from "fs";
import path from "path";

export const dynamic = "force-static";

export function GET() {
  const xml = readFileSync(path.join(process.cwd(), "content", "blog-feed.xml"), "utf8");
  return new Response(xml, {
    headers: {
      "Content-Type": "text/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
