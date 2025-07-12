"use client";

// --- 1. IMPORTS ---
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Komponen & Ikon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Impor Komponen Tabs

// Data & utilitas
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

// --- 2. SKEMA VALIDASI ZOD (Tidak ada perubahan) ---
const phoneRegex = new RegExp(/^(\+62|62|0)8[1-9][0-9]{7,14}$/);
const urlSchema = z
  .string()
  .url({ message: "URL tidak valid." })
  .optional()
  .or(z.literal(""));

const settingsSchema = z.object({
  shop_name: z.string().optional(),
  shop_tagline: z.string().optional(),
  contact_email: z
    .string()
    .email({ message: "Format email tidak valid." })
    .optional()
    .or(z.literal("")),
  contact_phone: z
    .string()
    .regex(phoneRegex, {
      message: "Format nomor telepon Indonesia tidak valid.",
    })
    .optional()
    .or(z.literal("")),
  shop_address: z.string().optional(),
  shop_latitude: z.string().optional(),
  shop_longitude: z.string().optional(),
  shipping_fee: z.coerce.number().optional(),
  seo_meta_title: z.string().optional(),
  seo_meta_description: z.string().optional(),
  seo_meta_keywords: z.string().optional(),
  social_facebook_url: urlSchema,
  social_instagram_url: urlSchema,
  social_twitter_url: urlSchema,
  social_tiktok_url: urlSchema,
  social_youtube_url: urlSchema,
  shop_logo_primary: z.any().optional(),
  shop_logo_secondary: z.any().optional(),
  shop_favicon: z.any().optional(),
  // Tambahkan validasi untuk hero section
  hero_headline: z.string().optional(),
  hero_subheadline: z.string().optional(),
  hero_background_image: z.any().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// --- 3. KOMPONEN SKELETON ---
const FormSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Skeleton className="h-10 w-36" />
    </div>
    <Separator />
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardHeader>
      <Separator/>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardHeader>
      <Separator/>
      <CardContent className="space-y-4">
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  </div>
);
// --- 4. KOMPONEN UTAMA ---
export default function SettingsData() {
  // ... (Semua state dan fungsi (useEffect, onSubmit, dll) tidak berubah)
  const [isLoading, setIsLoading] = useState(true);
  const [currentAssets, setCurrentAssets] = useState<{
    primary: string | null;
    secondary: string | null;
    favicon: string | null;
    hero: string | null;
  }>({ primary: null, secondary: null, favicon: null, hero: null });
  const [assetPreviews, setAssetPreviews] = useState<{
    primary: string | null;
    secondary: string | null;
    favicon: string | null;
    hero: string | null;
  }>({ primary: null, secondary: null, favicon: null, hero: null });
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });
  const [initialData, setInitialData] = useState<SettingsFormValues | null>(
    null
  );

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/admin/settings");
        const settings = response.data;
        reset(settings);
        setInitialData(settings);
        setCurrentAssets({
          primary: settings.shop_logo_primary || null,
          secondary: settings.shop_logo_secondary || null,
          favicon: settings.shop_favicon || null,
          hero: settings.hero_background_image || null,
        });
      } catch (error) {
        showError("Gagal memuat pengaturan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "primary" | "secondary" | "favicon" | "hero"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAssetPreviews((prev) => ({
          ...prev,
          [type]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SettingsFormValues) => {
    const formData = new FormData();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const formValue = data[key as keyof SettingsFormValues];
        const initialValue = initialData
          ? initialData[key as keyof SettingsFormValues]
          : undefined;
        if (formValue !== initialValue) {
          if (formValue instanceof FileList) {
            if (formValue.length > 0) formData.append(key, formValue[0]);
          } else if (formValue !== null && formValue !== undefined) {
            formData.append(key, String(formValue));
          }
        }
      }
    }
    if (!formData.entries().next().done) {
      try {
        await api.post("/admin/settings", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showSuccess("Pengaturan berhasil disimpan.");
        const response = await api.get("/admin/settings");
        reset(response.data);
        setInitialData(response.data);
        setCurrentAssets({
          primary: response.data.shop_logo_primary,
          secondary: response.data.shop_logo_secondary,
          favicon: response.data.shop_favicon,
          hero: response.data.hero_background_image,
        });
        setAssetPreviews({
          primary: null,
          secondary: null,
          favicon: null,
          hero: null,
        });
        setIsEditMode(false);
      } catch (error: any) {
        showError(
          error?.response?.data?.message || "Gagal menyimpan pengaturan."
        );
      }
    } else {
      showSuccess("Tidak ada perubahan untuk disimpan.");
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    reset(initialData || {});
    setAssetPreviews({
      primary: null,
      secondary: null,
      favicon: null,
      hero: null,
    });
    setIsEditMode(false);
  };
  if (isLoading) return <FormSkeleton />;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header Dinamis dengan Tombol Aksi */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Pengaturan Toko</h1>
            <p className="text-muted-foreground pt-1">
              {isEditMode
                ?  "Sedang dalam mode edit. Klik simpan jika sudah selesai."
                : "Lihat & kelola konfigurasi umum website."}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {!isEditMode ? (
              <Button type="button" onClick={() => setIsEditMode(true)}>
                Edit Pengaturan
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </>
            )}
          </div>
        </div>
        <Tabs defaultValue="toko" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="toko">Info Toko</TabsTrigger>
            <TabsTrigger value="tampilan">Homepage</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="lokasi">Lokasi</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="sosmed">Sosial Media</TabsTrigger>
          </TabsList>

          <fieldset disabled={!isEditMode} className="group">
            {/* TAB 1: INFORMASI TOKO */}
            <TabsContent value="toko" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Toko & Kontak</CardTitle>
                  <CardDescription>
                    Pengaturan dasar seperti nama, kontak, dan alamat.
                  </CardDescription>
                </CardHeader>
                <Separator/>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2" htmlFor="shop_name">Nama Toko</Label>
                      <Input id="shop_name" {...register("shop_name")} />
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="shop_tagline">Tagline Toko</Label>
                      <Input id="shop_tagline" {...register("shop_tagline")} />
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="contact_email">Email Kontak</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        {...register("contact_email")}
                      />
                      {errors.contact_email && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.contact_email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="contact_phone">Nomor Telepon</Label>
                      <Input
                        id="contact_phone"
                        {...register("contact_phone")}
                      />
                      {errors.contact_phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.contact_phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2" htmlFor="shop_address">Alamat Toko</Label>
                    <Textarea id="shop_address" {...register("shop_address")} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Biaya Pengiriman</CardTitle>
                  <CardDescription>
                    Pengaturan biaya pengiriman flat.
                  </CardDescription>
                </CardHeader>
                <Separator/>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2" htmlFor="shipping_fee">Biaya Pengiriman</Label>
                    <Input id="shipping_fee" {...register("shipping_fee")} />
                    {errors.shipping_fee && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.shipping_fee.message}
                        </p>
                      )}
                  </div>
                  
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: TAMPILAN HOMEPAGE */}
            <TabsContent value="tampilan">
              <Card>
                <CardHeader>
                  <CardTitle>Konten Hero Section</CardTitle>
                  <CardDescription>
                    Atur tampilan utama yang dilihat pengunjung di homepage.
                  </CardDescription>
                </CardHeader>
                <Separator/>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2" htmlFor="hero_headline">
                      Judul Utama (Gunakan &lt;br/&gt; untuk baris baru)
                    </Label>
                    <Textarea
                      id="hero_headline"
                      {...register("hero_headline")}
                    />
                  </div>
                  <div>
                    <Label className="mb-2" htmlFor="hero_subheadline">
                      Sub-Judul / Deskripsi Singkat
                    </Label>
                    <Textarea
                      id="hero_subheadline"
                      {...register("hero_subheadline")}
                    />
                  </div>
                  <div>
                    <Label className="mb-2" htmlFor="hero_background_image">
                      Gambar Latar Hero
                    </Label>
                    <Input
                      id="hero_background_image"
                      type="file"
                      accept="image/*"
                      {...register("hero_background_image", {
                        onChange: (e) => handleFileChange(e, "hero"),
                      })}
                      className="mt-1"
                    />
                    <div className="mt-4 p-2 border rounded-md w-full aspect-video bg-muted flex items-center justify-center">
                      <Image
                        src={
                          assetPreviews.hero ||
                          (currentAssets.hero
                            ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${currentAssets.hero}`
                            : "/placeholder.png")
                        }
                        alt="Preview Gambar Latar"
                        width={1000}
                        height={225}
                        // fill
                        className="object-contain rounded-md"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: BRANDING */}
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>Logo & Favicon</CardTitle>
                  <CardDescription>
                    Atur aset visual utama untuk brand toko.
                  </CardDescription>
                </CardHeader>
                <Separator/>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2" htmlFor="shop_logo_primary">
                        Logo untuk Latar Terang
                      </Label>
                      <Input
                        id="shop_logo_primary"
                        type="file"
                        accept="image/*"
                        {...register("shop_logo_primary", {
                          onChange: (e) => handleFileChange(e, "primary"),
                        })}
                        className="mt-1"
                      />
                      <div className="mt-4 p-2 border rounded-md w-fit bg-muted min-h-[60px] flex items-center justify-center">
                        <Image
                          src={
                            assetPreviews.primary ||
                            (currentAssets.primary
                              ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${currentAssets.primary}`
                              : "/placeholder.png")
                          }
                          alt="Preview Logo Utama"
                          width={150}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="shop_logo_secondary">
                        Logo untuk Latar Gelap
                      </Label>
                      <Input
                        id="shop_logo_secondary"
                        type="file"
                        accept="image/*"
                        {...register("shop_logo_secondary", {
                          onChange: (e) => handleFileChange(e, "secondary"),
                        })}
                        className="mt-1"
                      />
                      <div className="mt-4 p-2 border rounded-md w-fit bg-primary min-h-[60px] flex items-center justify-center">
                        <Image
                          src={
                            assetPreviews.secondary ||
                            (currentAssets.secondary
                              ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${currentAssets.secondary}`
                              : "/placeholder.png")
                          }
                          alt="Preview Logo Sekunder"
                          width={150}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="mb-2" htmlFor="shop_favicon">Ikon Favicon</Label>
                    <p className="text-xs text-muted-foreground mb-1">
                      Gunakan gambar persegi (disarankan 512x512px).
                    </p>
                    <Input
                      id="shop_favicon"
                      type="file"
                      accept="image/png, image/x-icon"
                      {...register("shop_favicon", {
                        onChange: (e) => handleFileChange(e, "favicon"),
                      })}
                    />
                    <div className="mt-4 p-2 border rounded-md w-fit bg-muted min-h-[60px] flex items-center justify-center">
                      <Image
                        src={
                          assetPreviews.favicon ||
                          (currentAssets.favicon
                            ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${currentAssets.favicon}`
                            : "/placeholder.png")
                        }
                        alt="Preview Favicon"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lokasi">
              <Card>
                <CardHeader>
                  <CardTitle>Lokasi & Peta</CardTitle>
                  <CardDescription>
                    Masukkan koordinat untuk menampilkan peta di halaman kontak.
                  </CardDescription>
                </CardHeader>
                <Separator/>
                <CardContent className="space-y-4">
               
                    <div>
                      <Label className="mb-2" htmlFor="shop_latitude">Latitude</Label>
                      <Input
                        id="shop_latitude"
                        {...register("shop_latitude")}
                        placeholder="-6.9501"
                      />
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="shop_longitude">Longitude</Label>
                      <Input
                        id="shop_longitude"
                        {...register("shop_longitude")}
                        placeholder="107.5896"
                      />
                    </div>
                
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pengiriman">
              <Card>
                <CardHeader>
                  <CardTitle>Pengiriman</CardTitle>
                  <CardDescription>
                    Atur biaya pengiriman standar untuk fallback atau promo.
                  </CardDescription>
                </CardHeader>
                <Separator/>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2" htmlFor="shipping_fee">
                      Biaya Ongkos Kirim Flat (Rp)
                    </Label>
                    <Input
                      id="shipping_fee"
                      type="number"
                      {...register("shipping_fee")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Metadata</CardTitle>
                  <CardDescription>
                    Bantu mesin pencari seperti Google menemukan dan memahami
                    toko.
                  </CardDescription>
                </CardHeader>
                <Separator/>
                <CardContent className="space-y-4">
                 
                    <div>
                      <Label className="mb-2" htmlFor="seo_meta_title">Judul Meta Default</Label>
                      <Input
                        id="seo_meta_title"
                        {...register("seo_meta_title")}
                      />
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="seo_meta_description">
                        Deskripsi Meta Default
                      </Label>
                      <Textarea
                        id="seo_meta_description"
                        {...register("seo_meta_description")}
                      />
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="seo_meta_keywords">
                        Keywords (pisahkan dengan koma)
                      </Label>
                      <Input
                        id="seo_meta_keywords"
                        {...register("seo_meta_keywords")}
                      />
                    </div>
           
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sosmed">
              <Card>
                <CardHeader>
                  <CardTitle>Sosial Media</CardTitle>
                  <CardDescription>
                    Tautkan profil sosial media toko.
                  </CardDescription>
                </CardHeader>
                <Separator/>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2" htmlFor="social_facebook_url">URL Facebook</Label>
                      <Input
                        id="social_facebook_url"
                        type="url"
                        {...register("social_facebook_url")}
                        placeholder="https://facebook.com/..."
                      />
                      {errors.social_facebook_url && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.social_facebook_url.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="social_instagram_url">
                        URL Instagram
                      </Label>
                      <Input
                        id="social_instagram_url"
                        type="url"
                        {...register("social_instagram_url")}
                        placeholder="https://instagram.com/..."
                      />
                      {errors.social_instagram_url && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.social_instagram_url.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="social_twitter_url">
                        URL Twitter / X
                      </Label>
                      <Input
                        id="social_twitter_url"
                        type="url"
                        {...register("social_twitter_url")}
                        placeholder="https://x.com/..."
                      />
                      {errors.social_twitter_url && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.social_twitter_url.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="social_tiktok_url">URL TikTok</Label>
                      <Input
                        id="social_tiktok_url"
                        type="url"
                        {...register("social_tiktok_url")}
                        placeholder="https://tiktok.com/@..."
                      />
                      {errors.social_tiktok_url && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.social_tiktok_url.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2" htmlFor="social_youtube_url">URL YouTube</Label>
                      <Input
                        id="social_youtube_url"
                        type="url"
                        {...register("social_youtube_url")}
                        placeholder="http://googleusercontent.com/youtube.com/..."
                      />
                      {errors.social_youtube_url && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.social_youtube_url.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </fieldset>
        </Tabs>
      </form>
    </div>
  );
}
