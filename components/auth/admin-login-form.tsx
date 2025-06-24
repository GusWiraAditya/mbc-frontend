// components/auth/AdminLoginForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validation';
import { loginAdmin } from '@/lib/auth';
import { showError, showSuccess } from '@/lib/toast';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

type Inputs = z.infer<typeof loginSchema>;

export default function AdminLoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Inputs>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: Inputs) => {
    try {
      await loginAdmin(data);
      showSuccess('Admin berhasil login');

      // ✅ LANGKAH KUNCI 1: REFRESH CACHE
      // Memberi tahu Next.js untuk membersihkan cache dan memastikan
      // session cookie yang baru akan terbaca di request selanjutnya.
      router.refresh();

      // ✅ LANGKAH KUNCI 2: REDIRECT KE HALAMAN YANG TEPAT
      // Arahkan ke dashboard admin yang sesungguhnya.
      router.push('/admin/dashboard'); 

    } catch (err: any) {
      showError(err?.response?.data?.message || 'Email atau password salah');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ... (Form fields tidak berubah) ... */}
       <div>
        <Label htmlFor="email" className='mb-2'>Email Admin</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password" className='mb-2'>Password</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Login'}
      </Button>
    </form>
  );
}