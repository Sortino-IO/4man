"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { NAV, WA, type NavItem } from "@/lib/nav";

const COLUMNS: Record<string, { href: string; label: string }[][]> = {
  "/facial-treatments-for-men": [
    [
      { href: "/facial-treatments-for-men/pigmentation-treatment", label: "טיפול בפיגמנטציה לגברים" },
      { href: "/facial-treatments-for-men/mesotherapy", label: "טיפולי מזותרפיה" },
      { href: "/facial-treatments-for-men/pre-wedding-facial-for-men", label: "טיפול לפני חתונה" },
      { href: "/facial-treatments-for-men/skin-peeling-treatment", label: "טיפולי פילינג" },
    ],
    [
      { href: "/facial-treatments-for-men/laser-acne-treatment", label: "טיפול באקנה בלייזר" },
      { href: "/facial-treatments-for-men/skin-rejuvenation-for-men", label: "חידוש עור" },
      { href: "/facial-treatments-for-men/wrinkle-elimination", label: "טיפול נגד קמטים וקמטוטים" },
      { href: "/facial-treatments-for-men/aesthetic-treatments-for-religious-men", label: "טיפולים אסתטיים לדתיים וחרדים" },
    ],
    [
      { href: "/treatments/eyebrows-hair-removal-for-men", label: "סידור גבות לגברים" },
      { href: "/facial-treatments-for-men/faq-facial-treatments-for-men", label: "טיפולי פנים לגבר - שאלות ותשובות" },
    ],
  ],
  "/hair-removal-methods": [
    [
      { href: "/hair-removal-methods/laser-beard-shaping", label: "סידור זקן בלייזר" },
      { href: "/hair-removal-methods/laser-hair-removal", label: "הסרת שיער בלייזר לגברים" },
    ],
    [
      { href: "/hair-removal-methods/wax-for-men", label: "הסרת שיער באמצעות שעווה לגברים" },
      { href: "/hair-removal-methods/all-methods-for-buttocks-hair-removal", label: "הסרת שיער בישבן" },
    ],
    [
      { href: "/hair-removal-methods/intimate", label: "הסרת שיער באזורים אינטימיים לגברים" },
      { href: "/hair-removal-methods/pricing", label: "מחירון" },
    ],
  ],
};

const MOBILE: { href: string; label: string; menu?: string }[] = [
  { href: "/", label: "ראשי" },
  { href: "/treatments", label: "טיפולים" },
  { href: "/hair-removal-methods", label: "הסרת שיער בכל השיטות", menu: "/hair-removal-methods" },
  { href: "/facial-treatments-for-men", label: "טיפולי פנים לגבר", menu: "/facial-treatments-for-men" },
  { href: "/accessibility", label: "הצהרת נגישות" },
  { href: "/recommendations", label: "המלצות" },
  { href: "/articles", label: "טיפים ומידע" },
];

function activeItem(item: NavItem, path: string) {
  if (item.href === "/") return path === "/";
  if (path === item.href) return true;
  const cols = COLUMNS[item.href];
  return !!cols?.some((col) => col.some((link) => link.href === path));
}

export function Header() {
  const path = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);
  const [mobileDrop, setMobileDrop] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!drop) return;
    const header = headerRef.current;
    if (!header) return;
    const place = () => {
      const parent = header.querySelector<HTMLElement>(`[data-nav="${CSS.escape(drop)}"]`);
      const mega = header.querySelector<HTMLElement>(".mega");
      if (!parent || !mega) return;
      const hb = header.getBoundingClientRect();
      const pb = parent.getBoundingClientRect();
      const width = mega.offsetWidth;
      const center = pb.left + pb.width / 2 - hb.left;
      const min = 12;
      const max = Math.max(min, hb.width - width - 12);
      mega.style.left = `${Math.min(Math.max(center - width / 2, min), max)}px`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [drop]);

  return (
    <header
      ref={headerRef}
      className="site-header"
      onMouseLeave={() => setDrop(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDrop(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setDrop(null);
      }}
    >
      <a className="skip" href="#content">
        לדלג לתוכן הראשי
      </a>
      <div className="header-bar">
        <Link href="/" className="brand" aria-label="4MAN" onClick={() => setOpen(false)}>
          <Image src="/media/fb072e_d47657eb267c4784bb1f4731be2a755c~mv2.png" alt="לוגו" width={63} height={63} />
          <span>4MAN.</span>
        </Link>
        <button
          className={open ? "menu-toggle open" : "menu-toggle"}
          type="button"
          aria-expanded={open}
          aria-label={open ? "סגור תפריט" : "תפריט"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className="main-nav" aria-label="ראשי">
          {NAV.map((item) => {
            const on = activeItem(item, path);
            const menu = COLUMNS[item.href];
            return (
              <div
                key={item.href}
                className="nav-item"
                data-nav={item.href}
                onMouseEnter={() => setDrop(menu ? item.href : null)}
                onFocus={() => {
                  if (menu) setDrop(item.href);
                }}
              >
                <Link
                  href={item.href}
                  className={on ? "active" : undefined}
                  aria-current={on ? "page" : undefined}
                  aria-expanded={menu ? drop === item.href : undefined}
                  aria-haspopup={menu ? "true" : undefined}
                >
                  {item.label}
                  {menu ? <i className="nav-caret" aria-hidden="true" /> : null}
                </Link>
                {menu && drop === item.href ? (
                  <div className="mega">
                    {menu.map((col, i) => (
                      <div key={i} className="mega-col">
                        {col.map((link) => (
                          <Link key={link.href} href={link.href} onClick={() => setDrop(null)}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <a className="wa-header" href={WA} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <WhatsIcon />
        </a>
      </div>
      {open ? (
        <nav className="mobile-nav" aria-label="תפריט">
          <button className="mobile-close" type="button" aria-label="סגור תפריט" onClick={() => setOpen(false)}>
            ×
          </button>
          {MOBILE.map((item) => {
            const cols = item.menu ? COLUMNS[item.menu] : undefined;
            const on = path === item.href;
            return (
              <div key={item.href} className="mobile-item">
                <div className="mobile-row">
                  {cols ? (
                    <button type="button" aria-expanded={mobileDrop === item.href} aria-label={item.label} onClick={() => setMobileDrop((v) => (v === item.href ? null : item.href))}>
                      {mobileDrop === item.href ? "▴" : "▾"}
                    </button>
                  ) : (
                    <span className="mobile-pad" />
                  )}
                  <Link href={item.href} className={on ? "active" : undefined} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </div>
                {cols && mobileDrop === item.href ? (
                  <div className="mobile-sub">
                    {cols.flat().map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}

function WhatsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path
        fill="#fff"
        d="M20.5 3.5A11 11 0 0 0 2.1 16.8L1 22.5l5.9-1.1A11 11 0 0 0 20.5 3.5zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.6.7-3.4-.2-.3A9.1 9.1 0 1 1 12 20.5zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.5 4 15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"
      />
    </svg>
  );
}
