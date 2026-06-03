"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  getUserById,
  updateUserProfile,
  UserProfile,
} from "@/services/user-service";
import { uploadImageToCloudinary } from "@/services/cloudinary-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardProfilePage() {
  const { firebaseUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [bio, setBio] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");

  async function loadProfile() {
    if (!firebaseUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getUserById(firebaseUser.uid);

      setProfile(data);
      setName(data?.name ?? "");
      setDisplayName(data?.displayName ?? "");
      setPhotoURL(data?.photoURL ?? "");
      setBio(data?.bio ?? "");
      setPhotoFile(null);
      setPhotoPreviewUrl("");
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil profil");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [firebaseUser]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPhotoFile(null);
      setPhotoPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ukuran foto maksimal 5MB");
      event.target.value = "";
      return;
    }

    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseUser) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    try {
      setSubmitLoading(true);

      let nextPhotoURL = photoURL;

      if (photoFile) {
        const uploadedPhoto = await uploadImageToCloudinary(photoFile);
        nextPhotoURL = uploadedPhoto.url;
      }

      await updateUserProfile(firebaseUser.uid, {
        name,
        displayName,
        photoURL: nextPhotoURL,
        bio,
      });

      await loadProfile();

      alert("Profil berhasil diperbarui");
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui profil");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat profil...</p>;
  }

  const previewImage = photoPreviewUrl || photoURL;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Profil Saya</h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola informasi profil yang akan tampil di halaman publik seller.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profil</CardTitle>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nama
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nama Tampilan
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Nama toko / username seller"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Foto Profil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Format gambar: JPG, PNG, WEBP. Maksimal 5MB.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Bio
                </label>
                <textarea
                  className="mt-2 min-h-[140px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Ceritakan profil seller kamu..."
                />
              </div>

              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? "Mengupload..." : "Simpan Profil"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Preview Public</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                  No Image
                </div>
              )}

              <div>
                <h2 className="font-bold text-slate-950">
                  {displayName || name || profile?.email || "Nama Seller"}
                </h2>

                <p className="mt-1 text-sm capitalize text-slate-500">
                  Role: {profile?.role || "-"}
                </p>
              </div>

              <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                {bio || "Bio seller belum diisi."}
              </p>

              {firebaseUser && (
                <a
                  href={`/seller-profile/${firebaseUser.uid}`}
                  className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Lihat profil publik
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}