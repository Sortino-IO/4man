"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV, WA } from "@/lib/nav";

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);

  return (
    <header className="site-header">
      <a className="skip" href="#content">
        לדלג לתוכן הראשי
      </a>
      <div className="header-bar">
        <Link href="/" className="brand" aria-label="4MAN">
          <Image src="/media/fb072e_d47657eb267c4784bb1f4731be2a755c~mv2.png" alt="לוגו" width={54} height={54} />
          <span>4MAN.</span>
        </Link>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-label="תפריט" onClick={() => setOpen((v) => !v)}>
          <span />
          <span />
          <span />
        </button>
        <nav className={open ? "main-nav open" : "main-nav"} aria-label="ראשי">
          {NAV.map((item) => {
            const active = item.href === "/" ? path === "/" : path === item.href || path.startsWith(item.href + "/");
            return (
              <div
                key={item.href}
                className={item.children ? "nav-item has-sub" : "nav-item"}
                onMouseEnter={() => item.children && setDrop(item.href)}
                onMouseLeave={() => setDrop(null)}
              >
                <Link href={item.href} className={active ? "active" : undefined} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
                {item.children && drop === item.href ? (
                  <div className="submenu">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} onClick={() => setOpen(false)}>
                        {child.label}
                      </Link>
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
    </header>
  );
}

function WhatsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.5 3.5A11 11 0 0 0 2.1 16.8L1 22.5l5.9-1.1A11 11 0 0 0 20.5 3.5zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.6.7-3.4-.2-.3A9.1 9.1 0 1 1 12 20.5zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.5 4 15 15 0 0 0 1.5.5 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"
      />
    </svg>
  );
}
