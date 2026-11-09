"use client";

import { useState } from "react";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq">
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <div key={item.q} className={expanded ? "faq-item open" : "faq-item"}>
            <h3>
              <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : i)}>
                <span>{item.q}</span>
                <span aria-hidden="true">{expanded ? "▴" : "▾"}</span>
              </button>
            </h3>
            {expanded ? <div className="faq-a">{item.a}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
