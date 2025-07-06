"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { registerSchema } from "@/lib/validation";
import { registerCustomer } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";
import { showError, showSuccess } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

// Menggunakan skema validasi registrasi yang baru
type Inputs = z.infer<typeof registerSchema>;

export default function CustomerRegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("password_confirmation");

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: Inputs) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Panggil fungsi register yang baru
      const userData = await registerCustomer(data);

      // Backend langsung me-login user, jadi kita update store di frontend
      const userWithRoles = { ...userData.user, roles: userData.roles };
      useAuthStore.setState({
        user: userWithRoles,
        isAuthenticated: true,
        isAuthLoading: false,
        isInitialized: true,
      });

      showSuccess("Registrasi berhasil! Silakan Login Kembali.");
      router.replace("/auth/login"); // Arahkan ke homepage setelah berhasil
    } catch (err: any) {
      // Menampilkan pesan error dari backend jika ada
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) {
        Object.values(serverErrors)
          .flat()
          .forEach((error: any) => showError(error));
      } else {
        showError(
          err?.response?.data?.message || "Registrasi gagal, silakan coba lagi."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="name" className="mb-3 block">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

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

        <div>
          <Label htmlFor="password" className="mb-3 block">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              disabled={isSubmitting}
              className="pr-10"
              {...register("password")}
            />
            {passwordValue && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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

        <div>
          <Label htmlFor="password_confirmation" className="mb-3 block">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-type your password"
              disabled={isSubmitting}
              className="pr-10"
              {...register("password_confirmation")}
            />
            {confirmPasswordValue && (
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
          {errors.password_confirmation && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin border-2 border-solid border-t-transparent rounded-full h-4 w-4 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
      </form>

      <Link href="http://localhost:8000/auth/google/redirect">
        <Button variant="outline" className="w-full mb-5">
          <FaGoogle />
          Sign up with Google
        </Button>
      </Link>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="underline underline-offset-4 text-primary font-semibold"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
