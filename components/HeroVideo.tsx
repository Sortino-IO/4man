"use client";

import { useEffect, useRef } from "react";

const DESKTOP = "/media/hero-720.mp4";
const MOBILE = "/media/hero-480.mp4";
const POSTER = "/media/fb072e_9a394a197ce3406094ba5eb1ba2a40abf000.jpg";

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let cancelled = false;

    const pick = window.matchMedia("(max-width: 767px)").matches ? MOBILE : DESKTOP;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    const file = pick.slice(pick.lastIndexOf("/") + 1);
    if (!video.currentSrc.endsWith(file)) {
      video.src = pick;
      video.load();
    }

    const play = () => {
      if (cancelled) return;
      video.muted = true;
      const pending = video.play();
      if (pending && typeof pending.catch === "function") {
        pending.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) play();
    else video.addEventListener("canplay", play, { once: true });

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", play);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={POSTER}
      width={720}
      height={1280}
      aria-hidden="true"
    >
      <source src={MOBILE} type="video/mp4" media="(max-width: 767px)" />
      <source src={DESKTOP} type="video/mp4" />
    </video>
  );
}
