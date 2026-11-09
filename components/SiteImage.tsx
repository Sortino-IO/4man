import Image from "next/image";

function toPx(value: number | string | undefined, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function SiteImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  className?: string;
}) {
  const w = toPx(width, 1200);
  const h = toPx(height, 800);
  if (/^https?:\/\//.test(src)) {
    return <img src={src} alt={alt || ""} width={w} height={h} className={className || "site-img"} />;
  }
  return (
    <Image
      src={src}
      alt={alt || ""}
      width={w}
      height={h}
      priority={priority}
      className={className || "site-img"}
      sizes="(max-width: 900px) 100vw, 960px"
    />
  );
}
