"use client";

import { useState, useEffect, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import StoreMap from '@/components/ui/StoreMap'; // Impor komponen peta kita
import { Mail, Phone, MapPin } from 'lucide-react';

// Tipe untuk data settings
type Settings = {
  shop_address: string;
  contact_email: string;
  contact_phone: string;
  shop_latitude: string;
  shop_longitude: string;
};

// Komponen Skeleton untuk halaman kontak
const ContactPageSkeleton = () => (
    <div className="container mx-auto px-4 py-16 md:py-24">
        <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto" />
        <Skeleton className="h-5 w-full max-w-lg mx-auto mt-4" />
        <div className="grid md:grid-cols-2 gap-12 mt-12">
            <div className="space-y-8">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
                 <div className="space-y-3">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
            </div>
            <div>
                <Skeleton className="w-full h-96 rounded-lg" />
            </div>
        </div>
    </div>
);


function ContactComponent() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ambil data pengaturan dari API yang sudah ada
    api.get('/admin/settings')
      .then(res => {
        setSettings(res.data);
      })
      .catch(err => {
        console.error("Gagal memuat pengaturan:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <ContactPageSkeleton />;
  }

  const latitude = parseFloat(settings?.shop_latitude || '0');
  const longitude = parseFloat(settings?.shop_longitude || '0');
  console.log(latitude,longitude);
  

  return (
    <div className="container mx-auto px-4 py-16 md:py-32">
      <h1 className="text-4xl font-bold text-center mb-4 text-primary">Hubungi Kami</h1>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16">
        Punya pertanyaan atau ingin berdiskusi? Kami siap membantu Anda. Kunjungi kami atau hubungi melalui detail di bawah ini.
      </p>
      
      <div className="grid md:grid-cols-5 gap-8 lg:gap-16 items-center border rounded-2xl p-8">
        {/* Kolom Info Alamat & Kontak */}
        <div className="md:col-span-2 space-y-8 border rounded-2xl p-6">
          <div className="flex gap-4 items-start">
            <MapPin className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold">Alamat Toko</h2>
              <p className="text-muted-foreground mt-1">
                {settings?.shop_address || 'Alamat tidak tersedia.'}
              </p>
            </div>
          </div>
           <div className="flex gap-4 items-start">
            <Mail className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold">Email</h2>
              <a href={`mailto:${settings?.contact_email}`} className="text-muted-foreground mt-1 hover:text-primary transition-colors">
                {settings?.contact_email || '-'}
              </a>
            </div>
           </div>
           <div className="flex gap-4 items-start">
            <Phone className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold">Telepon</h2>
              <a href={`https://wa.me/${settings?.contact_phone}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground mt-1 hover:text-primary transition-colors">
                {settings?.contact_phone || '-'}
              </a>
            </div>
           </div>
        </div>

        {/* Kolom Peta */}
        <div className="md:col-span-3">
          {latitude && longitude ? (
              <StoreMap 
                lat={latitude} 
                lng={longitude}
              />
            ) : (
                <div className="w-full h-96 rounded-lg bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Koordinat peta tidak diatur.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Komponen wrapper untuk Suspense
export default function ContactPage() {
    return (
        <Suspense fallback={<ContactPageSkeleton />}>
            <ContactComponent />
        </Suspense>
    )
}