"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Consent = { marketing: boolean; analytics: boolean; functional: boolean };

const DEFAULTS: Consent = { marketing: false, analytics: true, functional: true };

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<Consent>(DEFAULTS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("4man-consent");
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function save(next: Consent) {
    try {
      localStorage.setItem("4man-consent", JSON.stringify({ ...next, essential: true, at: Date.now() }));
    } catch {
      /* ignore private mode */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie" role="dialog" aria-label="הגדרות פרטיות">
      <div className="cookie-copy">
        <strong>הגדרות פרטיות</strong>
        <p>
          אתר זה משתמש בטכנולוגיות מעקב אחר אתרים של צד שלישי כדי לספק ולהמשיך לשפר את השירותים שלנו, ולהציג פרסומות
          בהתאם לתחומי העניין של המשתמשים. אני מסכים ועשוי לבטל או לשנות את הסכמתי בכל עת בעתיד.
        </p>
        <Link href="/privacy-policy">מידע נוסף</Link>
        <div className="toggles">
          <label>
            <input type="checkbox" checked={consent.marketing} onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })} />
            שיווק
          </label>
          <label>
            <input type="checkbox" checked={consent.analytics} onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })} />
            אנליטיקס
          </label>
          <label>
            <input type="checkbox" checked={consent.functional} onChange={(e) => setConsent({ ...consent, functional: e.target.checked })} />
            פונקציונאלי
          </label>
          <label>
            <input type="checkbox" checked disabled readOnly />
            חיוני
          </label>
        </div>
        <p className="uc">Powered by Usercentrics Consent Management</p>
      </div>
      <div className="cookie-actions">
        <button type="button" onClick={() => save(consent)}>
          שמירת הגדרות
        </button>
        <button type="button" onClick={() => save({ marketing: false, analytics: false, functional: false })}>
          דחה
        </button>
        <button type="button" onClick={() => save({ marketing: true, analytics: true, functional: true })}>
          אשר הכל
        </button>
      </div>
    </div>
  );
}
