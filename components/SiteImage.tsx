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
  return (
    <Image
      src={src}
      alt={alt || ""}
      width={toPx(width, 1200)}
      height={toPx(height, 800)}
      priority={priority}
      className={className || "site-img"}
      sizes="(max-width: 900px) 100vw, 960px"
    />
  );
}
