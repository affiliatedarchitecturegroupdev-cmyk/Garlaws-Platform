"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface Review {
  id: number;
  bookingId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  title: string;
  comment: string;
  categories: string[];
  createdAt: string;
  booking?: {
    serviceName: string;
    providerName: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/communication?type=reviews");
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-400";
    if (rating >= 3) return "text-yellow-400";
    return "text-red-400";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? "text-[#c5a059]" : "text-[#45a29e]/30"}`}
      >
        ★
      </span>
    ));
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === "all") return true;
    if (filter === "positive") return review.rating >= 4;
    if (filter === "neutral") return review.rating === 3;
    if (filter === "negative") return review.rating < 3;
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout activeTab="reviews">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Reviews...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="reviews">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Reviews</h1>
          <p className="text-[#45a29e]">
            View and manage reviews for your services
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-white font-medium mr-2">Filter:</span>
            {[
              { value: "all", label: "All Reviews", count: reviews.length },
              { value: "positive", label: "Positive (4-5★)", count: reviews.filter(r => r.rating >= 4).length },
              { value: "neutral", label: "Neutral (3★)", count: reviews.filter(r => r.rating === 3).length },
              { value: "negative", label: "Negative (1-2★)", count: reviews.filter(r => r.rating < 3).length },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? "bg-[#c5a059] text-[#0b0c10]"
                    : "bg-[#2d3b2d] border border-[#45a29e]/20 text-[#45a29e] hover:border-[#45a29e]/40"
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">No reviews found</h3>
              <p className="text-[#45a29e] mb-6">
                {filter === "all"
                  ? "You haven't received any reviews yet."
                  : `No ${filter} reviews found.`
                }
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                        {review.rating}/5
                      </span>
                      <span className="text-[#45a29e] text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{review.title}</h3>
                    <p className="text-[#45a29e] mb-4">{review.comment}</p>

                    {review.categories && review.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {review.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#2d3b2d] border border-[#45a29e]/20 text-[#45a29e] text-xs rounded-lg"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}

                    {review.booking && (
                      <div className="text-sm text-[#45a29e]">
                        <p>Service: {review.booking.serviceName}</p>
                        {review.booking.providerName && <p>Provider: {review.booking.providerName}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors text-sm">
                      Reply
                    </button>
                    <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {reviews.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
              <div className="text-3xl font-bold text-white mb-2">{reviews.length}</div>
              <div className="text-[#45a29e] text-sm">Total Reviews</div>
            </div>

            <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
              <div className="text-3xl font-bold text-[#c5a059] mb-2">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div className="text-[#45a29e] text-sm">Average Rating</div>
            </div>

            <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <div className="text-[#45a29e] text-sm">Positive Reviews</div>
            </div>

            <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100).toFixed(0)}%
              </div>
              <div className="text-[#45a29e] text-sm">Satisfaction Rate</div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}