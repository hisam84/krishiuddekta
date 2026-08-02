"use client";

import { useState } from "react";
import { StarRating } from "components/ui/star-rating";
import { Button } from "components/ui/button";
import { toast } from "sonner";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export function ProductReviewsSection({
  productId,
  initialReviews = [],
}: {
  productId: string;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !comment) {
      toast.error("Please enter your name and review comment");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          reviewer_name: reviewerName,
          rating,
          comment,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Thank you for your review!");
        setReviews([
          {
            id: `rev-${Date.now()}`,
            reviewer_name: reviewerName,
            rating,
            comment,
            created_at: new Date().toISOString(),
          },
          ...reviews,
        ]);
        setReviewerName("");
        setComment("");
        setShowForm(false);
      } else {
        toast.error("Failed to submit review");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Customer Reviews ({reviews.length})
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Real feedback from verified buyers</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "✍️ Write a Review"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl bg-emerald-50/50 p-4 border border-emerald-100 dark:border-neutral-800 dark:bg-neutral-800/40 text-xs">
          <div>
            <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Abul Hossain"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
              Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white font-bold text-amber-500"
            >
              <option value="5">★★★★★ (5/5 Exceptional)</option>
              <option value="4">★★★★☆ (4/5 Very Good)</option>
              <option value="3">★★★☆☆ (3/5 Average)</option>
              <option value="2">★★☆☆☆ (2/5 Below Average)</option>
              <option value="1">★☆☆☆☆ (1/5 Poor)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
              Review Comment *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Share your experience with this agricultural product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <Button type="submit" disabled={submitting} size="sm">
            {submitting ? "Submitting..." : "Submit Review ➔"}
          </Button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="mt-6 text-xs text-neutral-500">No reviews submitted yet for this product. Be the first to review!</p>
      ) : (
        <div className="mt-6 divide-y divide-neutral-100 dark:divide-neutral-800 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="pt-4 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 dark:text-white">{r.reviewer_name}</span>
                <StarRating rating={r.rating} showScore={false} />
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 italic">"{r.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
