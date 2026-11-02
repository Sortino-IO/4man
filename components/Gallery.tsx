"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type GalleryItem = { src: string; alt: string };

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function circ(i: number, active: number, n: number) {
  let d = i - active;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: GalleryItem[];
  index: number;
  onIndex: (n: number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; panX: number; panY: number; zoom: number } | null>(null);
  const moved = useRef(0);
  const item = items[index];

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex(mod(index - 1, items.length));
      if (e.key === "ArrowRight") onIndex(mod(index + 1, items.length));
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, items.length, onClose, onIndex]);

  if (!item) return null;

  function step(dir: number) {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onIndex(mod(index + dir, items.length));
  }

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="תצוגת תמונה">
      <button type="button" className="lb-close" aria-label="סגירה" onClick={onClose}>
        ×
      </button>
      <button type="button" className="lb-zoom" aria-label={zoom > 1 ? "הקטנה" : "הגדלה"} onClick={() => { setZoom((z) => (z > 1 ? 1 : 2.2)); setPan({ x: 0, y: 0 }); }}>
        {zoom > 1 ? "−" : "+"}
      </button>
      <p className="lb-count">
        {index + 1} / {items.length}
      </p>
      {items.length > 1 ? (
        <>
          <button type="button" className="gal-arrow prev" aria-label="הקודם" onClick={() => step(-1)}>
            ‹
          </button>
          <button type="button" className="gal-arrow next" aria-label="הבא" onClick={() => step(1)}>
            ›
          </button>
        </>
      ) : null}
      <img
        className={zoom > 1 ? "lb-photo zoomed" : "lb-photo"}
        src={item.src}
        alt={item.alt}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        draggable={false}
        onDoubleClick={() => {
          setZoom((z) => (z > 1 ? 1 : 2.2));
          setPan({ x: 0, y: 0 });
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y, zoom };
          moved.current = 0;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          moved.current = Math.max(moved.current, Math.abs(dx), Math.abs(dy));
          if (d.zoom > 1) setPan({ x: d.panX + dx, y: d.panY + dy });
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (!d || d.zoom > 1 || moved.current > 8) {
            if (d && d.zoom === 1 && moved.current > 40) step(e.clientX - d.x < 0 ? 1 : -1);
            return;
          }
        }}
      />
      {item.alt ? <p className="lb-cap">{item.alt}</p> : null}
    </div>,
    document.body,
  );
}

export function useLightbox(items: GalleryItem[]) {
  const [index, setIndex] = useState<number | null>(null);
  const view =
    index !== null ? <Lightbox items={items} index={index} onIndex={setIndex} onClose={() => setIndex(null)} /> : null;
  return { open: (i: number) => setIndex(i), view };
}

const CERTIFICATES: GalleryItem[] = [
  { src: "/media/fb072e_8a1c8df879074c53b4db9355b932f417~mv2.png", alt: "תעודת הסמכה" },
  { src: "/media/fb072e_178e872e769448ecab6b959437652894~mv2.jpg", alt: "תעודת השתלמות" },
  { src: "/media/fb072e_4376bd2da5af47e383d5c51e8e6a9e6f~mv2.jpg", alt: "תעודת Alma Lasers על שם ויטו קופר" },
  { src: "/media/fb072e_82f3311deb114ff18032e8f45675ec7c~mv2.jpg", alt: "תעודת Vito Cosmetics" },
  { src: "/media/fb072e_987b8a8bf56942319e6725aecdd1165e~mv2.jpg", alt: "תעודת ארומתרפיה" },
  { src: "/media/fb072e_b46721c4ff1549b59b91ef05415a6ac0~mv2.png", alt: "תעודת GentleMax Pro Plus" },
  { src: "/media/fb072e_4cf25bd51d564a90922a398c722bcd36~mv2.jpg", alt: "תעודת 4MP" },
  { src: "/media/fb072e_fbcadb28b6ad4dd69dbd25d155633f0b~mv2.jpeg", alt: "תעודת הסמכה מקצועית" },
  { src: "/media/fb072e_035c2fee08c94ed19c37d0508d97ca8a~mv2.png", alt: "תעודת השתלמות מקצועית" },
  { src: "/media/fb072e_395ac51422ba4c5d8473b037d69d3128~mv2.png", alt: "תעודת לימודים" },
];

export function Coverflow({ items = CERTIFICATES, start = 4 }: { items?: GalleryItem[]; start?: number }) {
  const [active, setActive] = useState(start);
  const [dragX, setDragX] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; moved: number; index: number } | null>(null);
  const { open, view } = useLightbox(items);
  const n = items.length;

  function go(dir: number) {
    setActive((i) => mod(i + dir, n));
  }

  return (
    <div
      className="coverflow"
      ref={box}
      dir="ltr"
      role="region"
      aria-roledescription="קרוסלה"
      aria-label="תעודות הסמכה"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button.gal-arrow, .lightbox")) return;
        const card = (e.target as HTMLElement).closest(".cover-card");
        pointer.current = { x: e.clientX, moved: 0, index: card ? Number((card as HTMLElement).dataset.i) : -1 };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!pointer.current) return;
        const dx = e.clientX - pointer.current.x;
        pointer.current.moved = Math.max(pointer.current.moved, Math.abs(dx));
        setDragX(dx);
      }}
      onPointerUp={(e) => {
        const p = pointer.current;
        pointer.current = null;
        setDragX(0);
        if (!p) return;
        if (p.moved > 40) {
          go(e.clientX - p.x < 0 ? 1 : -1);
          return;
        }
        if (p.moved <= 8 && p.index >= 0) {
          setActive(p.index);
          open(p.index);
        }
      }}
      onPointerCancel={() => {
        pointer.current = null;
        setDragX(0);
      }}
    >
      {items.map((item, i) => {
        const offset = circ(i, active, n);
        if (Math.abs(offset) > 3) {
          return <img key={item.src} src={item.src} alt={item.alt} className="cover-seo" />;
        }
        const width = box.current?.clientWidth || 1000;
        const shift = offset * 34 + (dragX / width) * 100;
        const scale = Math.max(0.42, 1 - Math.abs(offset) * 0.18);
        const lift = Math.abs(offset) * 6;
        return (
          <button
            key={item.src}
            type="button"
            className="cover-card"
            data-i={i}
            style={{
              transform: `translate(-50%, -50%) translate(${shift}%, ${-lift}%) scale(${scale}) rotateY(${offset * -22}deg)`,
              zIndex: 20 - Math.abs(offset),
            }}
          >
            <img src={item.src} alt={item.alt} draggable={false} />
          </button>
        );
      })}
      <button type="button" className="gal-arrow prev" aria-label="הקודם" onClick={() => go(-1)}>
        ‹
      </button>
      <button type="button" className="gal-arrow next" aria-label="הבא" onClick={() => go(1)}>
        ›
      </button>
      {view}
    </div>
  );
}

const FULL_W = 1710;
const FULL_H = 384;

const MOSAIC: (GalleryItem & { x: number; y: number; w: number; h: number; frame?: boolean })[] = [
  { src: "/media/fb072e_d5e8c8ea48d644d798c287181cd07423~mv2.jpg", alt: "אקווריום בקליניקה", x: 0, y: 0, w: 284, h: 190 },
  { src: "/media/fb072e_74b038bc7984433f80742dacae181c13~mv2.jpg", alt: "חדר טיפולים", x: 0, y: 195, w: 284, h: 189 },
  { src: "/media/fb072e_d63165e329624cd7881e214b9b6846a1~mv2.jpg", alt: "פינת המתנה", x: 289, y: 0, w: 79, h: 118 },
  { src: "/media/fb072e_2e204bec3b494b218c4300ed924d3e04~mv2.jpg", alt: "עמדת שטיפה", x: 373, y: 0, w: 177, h: 118 },
  { src: "/media/fb072e_cb9a09bac4ed4ef596c535f341b224ff~mv2.png", alt: "ויטו קופר", x: 289, y: 123, w: 261, h: 261, frame: true },
  { src: "/media/fb072e_9f0d51ae2fe6465cb1eaf64c20d59cae~mv2.jpg", alt: "חדר טיפולים עם תריסים", x: 555, y: 0, w: 575, h: 384 },
  { src: "/media/fb072e_d9c60f5d8b1c47d094ea5aaca34c25f7~mv2.jpg", alt: "מיטת טיפולים", x: 1135, y: 0, w: 575, h: 384 },
];

export function MosaicGallery({ items = MOSAIC }: { items?: typeof MOSAIC }) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const drag = useRef<{ x: number; origin: number; moved: number; index: number } | null>(null);
  const { open, view } = useLightbox(items);
  const max = () => {
    const el = viewRef.current;
    if (!el) return 0;
    return el.clientWidth * (FULL_W / 1216 - 1);
  };

  function clamp(n: number) {
    return Math.max(-max(), Math.min(0, n));
  }

  function page(dir: number) {
    const el = viewRef.current;
    if (!el) return;
    setX((v) => clamp(v - dir * el.clientWidth * 0.72));
  }

  return (
    <div
      className="about-collage"
      ref={viewRef}
      dir="ltr"
      role="region"
      aria-roledescription="קרוסלה"
      aria-label="תמונות הקליניקה"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button.gal-arrow, .lightbox")) return;
        const tile = (e.target as HTMLElement).closest(".tile");
        drag.current = { x: e.clientX, origin: x, moved: 0, index: tile ? Number((tile as HTMLElement).dataset.i) : -1 };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
        setX(clamp(drag.current.origin + dx));
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (d && d.moved <= 8 && d.index >= 0) open(d.index);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <div className="mosaic-track" style={{ transform: `translateX(${x}px)` }}>
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            className={item.frame ? "tile framed" : "tile"}
            data-i={i}
            style={{
              left: `${(item.x / FULL_W) * 100}%`,
              top: `${(item.y / FULL_H) * 100}%`,
              width: `${(item.w / FULL_W) * 100}%`,
              height: `${(item.h / FULL_H) * 100}%`,
            }}
          >
            <img src={item.src} alt={item.alt} draggable={false} />
          </button>
        ))}
      </div>
      <button type="button" className="gal-arrow prev" aria-label="הקודם" hidden={x >= -2} onClick={() => page(-1)}>
        ‹
      </button>
      <button type="button" className="gal-arrow next" aria-label="הבא" onClick={() => page(1)}>
        ›
      </button>
      {view}
    </div>
  );
}

export function GalleryStrip({ items }: { items: GalleryItem[] }) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const drag = useRef<{ x: number; origin: number; moved: number; index: number } | null>(null);
  const { open, view } = useLightbox(items);
  const max = () => {
    const el = viewRef.current;
    const track = el?.firstElementChild as HTMLElement | null;
    if (!el || !track) return 0;
    return Math.max(0, track.scrollWidth - el.clientWidth);
  };
  const clamp = (n: number) => Math.max(-max(), Math.min(0, n));

  function page(dir: number) {
    const el = viewRef.current;
    if (!el) return;
    setX((v) => clamp(v - dir * el.clientWidth * 0.8));
  }

  return (
    <div
      className="gallery-strip"
      ref={viewRef}
      dir="ltr"
      role="region"
      aria-roledescription="קרוסלה"
      aria-label="גלריה"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button.gal-arrow, .lightbox")) return;
        const slide = (e.target as HTMLElement).closest(".strip-slide");
        drag.current = { x: e.clientX, origin: x, moved: 0, index: slide ? Number((slide as HTMLElement).dataset.i) : -1 };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
        setX(clamp(drag.current.origin + dx));
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (d && d.moved <= 8 && d.index >= 0) open(d.index);
      }}
    >
      <div className="strip-track" style={{ transform: `translateX(${x}px)` }}>
        {items.map((item, i) => (
          <button
            key={item.src + i}
            type="button"
            className="strip-slide"
            data-i={i}
          >
            <img src={item.src} alt={item.alt} draggable={false} />
          </button>
        ))}
      </div>
      {items.length > 1 ? (
        <>
          <button type="button" className="gal-arrow prev" aria-label="הקודם" onClick={() => page(-1)}>
            ‹
          </button>
          <button type="button" className="gal-arrow next" aria-label="הבא" onClick={() => page(1)}>
            ›
          </button>
        </>
      ) : null}
      {view}
    </div>
  );
}
