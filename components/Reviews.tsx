import { getReviews } from "@/lib/content";

export function Reviews({ limit }: { limit?: number }) {
  const { stats, items } = getReviews();
  const list = limit ? items.slice(0, limit) : items;
  return (
    <section className="reviews" aria-label="המלצות גוגל">
      <header className="reviews-head">
        <h2>המלצות גוגל</h2>
        {stats ? (
          <p>
            דירוג {stats.overall_rating} מתוך 5 · {stats.reviews_count} ביקורות
          </p>
        ) : null}
      </header>
      <div className="review-grid">
        {list.map((r, i) => (
          <article key={`${r.name}-${r.date}-${i}`} className="review-card">
            <div className="review-top">
              <strong>{r.name}</strong>
              <span className="stars" aria-label={`${r.rating} כוכבים`}>
                {"★★★★★".slice(0, r.rating)}
              </span>
            </div>
            <p>{r.text}</p>
            <small>
              {r.date}
              {r.city ? ` · ${r.city}` : ""}
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}
