"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";

import { loginSchema } from "@/lib/validation";
import { loginCustomer } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";
import { useCartStore } from "@/lib/store/useCartStore";
import { showError, showSuccess } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// REVISI: Mengimpor ikon mata
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";

type Inputs = z.infer<typeof loginSchema>;

export default function CustomerLoginForm() {
  // REVISI: Tambahkan 'watch' dari useForm untuk memantau input
  const {
    register,
    handleSubmit,
    watch, // <-- Tambahkan ini
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(loginSchema),
  });

  // Pantau nilai dari input password
  const passwordValue = watch("password");

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // REVISI: State untuk mengontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false);

  // REVISI: Ambil parameter redirect dari URL
  const redirectUrl = searchParams.get("redirect") || "/";

  const onSubmit = async (data: Inputs) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userData = await loginCustomer(data);
      const userWithRoles = { ...userData.user, roles: userData.roles };
      useAuthStore.setState({
        user: userWithRoles,
        isAuthenticated: true,
        isAuthLoading: false,
        isInitialized: true,
      });

      await useCartStore.getState().mergeAndSyncCart();

      showSuccess("Login berhasil");
      // REVISI: Redirect ke halaman yang dituju atau homepage
      router.replace(redirectUrl);
    } catch (err: any) {
      showError(err?.response?.data?.message || "Login gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  // REVISI: Fungsi untuk membuat URL Google Login dengan parameter redirect
  const getGoogleLoginUrl = () => {
    const baseUrl = "http://localhost:8000/auth/google/redirect";
    if (redirectUrl !== "/") {
      return `${baseUrl}?redirect=${encodeURIComponent(redirectUrl)}`;
    }
    return baseUrl;
  };

  return (
    <div className="space-y-5">
      {/* REVISI: Tampilkan pesan jika user diarahkan untuk login */}
      {redirectUrl !== "/" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium">Login Required</p>
          <p>Please login to continue to your desired page.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="email" className="mb-3 block">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="email@example.com"
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* REVISI: Bagian input password sekarang memiliki ikon mata */}
        <div>
          <div className="flex items-center mb-3">
            <Label htmlFor="password" className="block">
              Password
            </Label>
            <Link
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isSubmitting}
              placeholder="********"
              className="pr-10"
              {...register("password")}
            />
            {/* Ikon mata hanya akan dirender jika ada isi di dalam input password */}
            {passwordValue && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin border-2 border-solid border-t-transparent rounded-full h-4 w-4 border-white"></div>
              <span>Memproses...</span>
            </div>
          ) : (
            "Login"
          )}
        </Button>

        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
      </form>

      {/* REVISI: Google Login dengan parameter redirect */}
      <Link href={getGoogleLoginUrl()}>
        <Button variant="outline" className="w-full mb-5">
          <FaGoogle />
          Login with Google
        </Button>
      </Link>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href={`/auth/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="underline underline-offset-4 text-primary font-semibold"
        >
          Sign up
        </Link>
      </div>

    </div>
  );
}