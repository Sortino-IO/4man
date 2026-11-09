import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0];
  if (host === "4man.co.il") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "www.4man.co.il";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  const path = request.nextUrl.pathname;
  if (path === "/blog" || path.startsWith("/blog/")) {
    return NextResponse.redirect(new URL("/articles", request.url), 301);
  }
  if (path === "/hl-products" || path.startsWith("/hl-products/")) {
    return NextResponse.redirect(new URL("/", request.url), 301);
  }
  if (path === "/articles/page/1" || path === "/articles/page/3") {
    return NextResponse.redirect(new URL("/articles", request.url), 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|media/|favicon.ico).*)"],
};
