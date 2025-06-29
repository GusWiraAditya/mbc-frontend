"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import logoPrim from "@/public/logo/mbc-primary.png";
import Image from "next/image";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized, isAuthLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  // const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        // console.error("Auth initialization error:", error);
        throw new Error("Failed to initialize authentication");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    } else {
      setIsLoading(false);
    }
  }, [initialize, isInitialized]);

  // Show loading only during initial authentication check
  if (isLoading || (!isInitialized && isAuthLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <Image
            src={logoPrim}
            alt="MBC Logo"
            width={120}
            height={120}
            className="mb-2"
            priority
          />
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
            role="status"
            aria-label="loading"
          />
          {/* <p className="text-sm text-muted-foreground">
            Verifying authentication...
          </p> */}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
