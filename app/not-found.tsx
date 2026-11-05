import Link from "next/link";

export default function NotFound() {
  return (
    <article className="page">
      <div className="wrap center">
        <h1>העמוד לא נמצא</h1>
        <p>הכתובת שביקשת לא קיימת באתר 4MAN.</p>
        <p>
          <Link className="btn gold" href="/">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </article>
  );
}
