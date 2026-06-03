"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getPublicUserProfile,
  UserProfile,
} from "@/services/user-service";
import { getSellerAccountListings } from "@/services/account-listing-service";
import { AccountListing } from "@/types/account-listing";
import {
  calculateAverageRating,
  getReviewsBySellerId,
  SellerReview,
} from "@/services/seller-review-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatGameName(game: string) {
  return game
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SellerPublicProfilePage() {
  const params = useParams<{ sellerId: string }>();

  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<AccountListing[]>([]);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const [sellerData, listingData, reviewData] = await Promise.all([
        getPublicUserProfile(params.sellerId),
        getSellerAccountListings(params.sellerId),
        getReviewsBySellerId(params.sellerId),
      ]);

      setSeller(sellerData);
      setListings(
        listingData.filter((listing) => listing.status === "published")
      );
      setReviews(reviewData);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil profil seller");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [params.sellerId]);

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat profil seller...</p>;
  }

  if (!seller) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-950">
          Seller tidak ditemukan
        </h1>
        <p className="text-sm text-slate-500">
          Profil seller ini tidak tersedia.
        </p>
      </div>
    );
  }

  const sellerName = seller.name || seller.displayName || seller.email || seller.id;
  const averageRating = calculateAverageRating(reviews);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil Seller</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {seller.photoURL ? (
                <img
                  src={seller.photoURL}
                  alt={sellerName}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-slate-950">
                  {sellerName}
                </h1>
                {seller.bio && (
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                    {seller.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="text-slate-500">Akun yang Dijual</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {listings.length}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="text-slate-500">Rating</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {reviews.length > 0 ? averageRating.toFixed(1) : "-"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {reviews.length} review
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DaftarAkun Dijual</CardTitle>
        </CardHeader>

        <CardContent>
          {listings.length === 0 ? (
            <p className="text-sm text-slate-500">
              Seller ini belum memiliki akun yang dijual.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <a
                  key={listing.id}
                  href={`/akun-ml/${listing.id}`}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30"
                >
                  <p className="text-xs font-medium text-blue-600">
                    {formatGameName(listing.game)}
                  </p>

                  <h2 className="mt-2 font-semibold text-slate-950">
                    {listing.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {listing.description}
                  </p>

                  <p className="mt-4 font-bold text-slate-950">
                    {formatRupiah(listing.price)}
                  </p>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Seller</CardTitle>
        </CardHeader>

        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">
              Seller ini belum memiliki review.
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">
                        Rating {review.rating}/5
                      </p>
                      <p className="mt-1 max-w-[220px] break-all text-xs text-slate-500">
                        Buyer: {review.buyerId}
                      </p>
                    </div>

                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                      ★ {review.rating}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}