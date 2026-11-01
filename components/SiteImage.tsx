import Image from "next/image";

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
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt || ""}
      width={width || 1200}
      height={height || 800}
      priority={priority}
      className={className || "site-img"}
      sizes="(max-width: 900px) 100vw, 960px"
    />
  );
}
