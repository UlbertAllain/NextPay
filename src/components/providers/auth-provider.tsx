"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  User,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase/client";
import { AppUser } from "@/types/user";

type AuthContextType = {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  appUser: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  const [appUser, setAppUser] = useState<AppUser | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));

        if (snapshot.exists()) {
          setAppUser(snapshot.data() as AppUser);
        }
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      appUser,
      loading,
    }),
    [firebaseUser, appUser, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}