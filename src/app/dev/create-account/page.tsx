"use client";

import { useAuth } from "@/components/providers/auth-provider";

import { createAccountListing } from "@/services/account-listing-service";

import { Button } from "@/components/ui/button";

export default function DevCreateAccountPage() {
  const { firebaseUser } = useAuth();

  async function handleCreate() {
    if (!firebaseUser) {
      alert("Login dulu");
      return;
    }

    try {
      await createAccountListing({
        sellerId: firebaseUser.uid,

        game: "mobile-legends",

        title: "Akun ML Mythic Immortal 200 Skin",

        description:
          "Akun aman, email bisa diganti, banyak skin collector.",

        price: 750000,

        rank: "Mythic Immortal",

        skins: 200,

        heroes: 120,
      });

      alert("Listing berhasil dibuat");
    } catch (error) {
      console.error(error);

      alert("Gagal create listing");
    }
  }

  return (
    <main className="p-10">
      <Button onClick={handleCreate}>
        Create Dummy Account Listing
      </Button>
    </main>
  );
}