"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { loginSchema } from "@/lib/validation";
import { loginCustomer } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";
import { showError, showSuccess } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// REVISI: Mengimpor ikon mata
import { Eye, EyeOff } from "lucide-react";

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
  const passwordValue = watch('password');

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // REVISI: State untuk mengontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false);

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

      showSuccess("Berhasil login");
      router.replace("/");
    } catch (err: any) {
      showError(err?.response?.data?.message || "Login gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email" className="mb-2 block">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>
      
      {/* REVISI: Bagian input password sekarang memiliki ikon mata */}
      <div>
        <Label htmlFor="password" className="mb-2 block">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isSubmitting}
            className="pr-10"
            {...register("password")}
          />
          {/* Ikon mata hanya akan dirender jika ada isi di dalam input password */}
          {passwordValue && (
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin border-2 border-solid border-t-transparent rounded-full h-4 w-4 border-white"></div>
            <span>Memproses...</span>
          </div>
        ) : (
          'Login'
        )}
      </Button>
    </form>
  );
}
