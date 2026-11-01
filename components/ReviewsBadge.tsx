import Link from "next/link";
import { getReviews } from "@/lib/content";

export function ReviewsBadge() {
  const { stats } = getReviews();
  if (!stats) return null;
  return (
    <Link className="reviews-badge" href="/recommendations" aria-label={`${stats.overall_rating} מתוך 5, ${stats.reviews_count} ביקורות גוגל`}>
      <span className="badge-mark" aria-hidden="true">
        G
      </span>
      <span>
        <strong>{stats.overall_rating}</strong> <span className="stars">★★★★★</span>
        <small>{stats.reviews_count} REVIEWS</small>
      </span>
    </Link>
  );
}
