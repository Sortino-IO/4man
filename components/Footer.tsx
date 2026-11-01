import Image from "next/image";
import Link from "next/link";
import { FOOTER, WA } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="col-title">מידע</p>
          <ul>
            {FOOTER.info.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="col-title">טיפולים</p>
          <ul>
            {FOOTER.face.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="col-title">הסרת שיער לגברים</p>
          <ul>
            {FOOTER.hair.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-brand">
          <Image src="/media/fb072e_20ffa26b2ae1466b9375fdda22b83741~mv2.png" alt="לוגו" width={64} height={64} />
          <strong>4MAN.</strong>
          <p>כתובת: רח׳ ריינס 18, תל-אביב (בית הרופאים)</p>
          <a className="btn gold" href={WA} target="_blank" rel="noopener noreferrer">
            שלח וואטסאפ
          </a>
          <div className="socials">
            <a href="https://www.instagram.com/4mantlv?igsh=MTJrZnl6dm5jMGEyaA==" target="_blank" rel="noopener noreferrer">
              <Image src="/media/8d6893330740455c96d218258a458aa4.png" alt="Instagram" width={39} height={39} />
            </a>
            <a href="https://www.facebook.com/4mantlv/" target="_blank" rel="noopener noreferrer">
              <Image src="/media/e316f544f9094143b9eac01f1f19e697.png" alt="Facebook" width={39} height={39} />
            </a>
          </div>
        </div>
      </div>
      <p className="powered">©Build by Adi Tahar. Powered and secured by Wix</p>
    </footer>
  );
}
