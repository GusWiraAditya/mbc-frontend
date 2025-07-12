"use client";

// --- 1. IMPORTS ---
import {
  useState,
  useEffect,
  FormEvent,
  useRef,
  ChangeEvent,
  ReactNode,
} from "react";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Komponen & Ikon
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Cake,
  VenetianMask,
  Loader2,
  Camera,
} from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import { format, parseISO } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { ProfileInfoRow } from "@/components/account/ProfileInfoRow";
import { profileSchema, ProfileFormData } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";

export const ProfileSection = () => {
  const { user, fetchUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // State untuk pratinjau gambar profil
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // REVISI: Gunakan react-hook-form untuk manajemen form
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      date_of_birth: new Date(),
      gender: undefined,
    },
  });

  // Sinkronkan form data dengan data user dari store
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        phone_number: user.phone_number || "",
        date_of_birth: user.date_of_birth ? parseISO(user.date_of_birth) : null,
        gender: user.gender || undefined,
      });

      // REVISI: Logika cerdas untuk menampilkan gambar profil
      const picturePath = user.profile_picture;
      if (picturePath) {
        // Fallback jika accessor tidak ada, kita bangun URL-nya di sini
        setProfilePicturePreview(
          `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${picturePath}`
        );
      } else {
        setProfilePicturePreview(null);
      }
    }
  }, [user, form]);

  const handleCancelClick = () => {
    setIsEditing(false);
    form.reset(); // Reset form ke nilai default dari useEffect
    setProfilePictureFile(null);
    // Kembalikan preview ke gambar asli
    const originalUrl = user?.profile_picture
      ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${user.profile_picture}`
      : null;
    setProfilePicturePreview(originalUrl);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const submissionData = new FormData();
    submissionData.append("name", data.name);
    submissionData.append("phone_number", data.phone_number || "");
    // REVISI: Format objek Date menjadi string YYYY-MM-DD untuk backend
    if (data.date_of_birth) {
      submissionData.append(
        "date_of_birth",
        format(data.date_of_birth, "yyyy-MM-dd")
      );
    } else {
      submissionData.append("date_of_birth", "");
    }
    submissionData.append("gender", data.gender || "");

    if (profilePictureFile) {
      submissionData.append("profile_picture", profilePictureFile);
    }
    try {
      submissionData.append("_method", "PUT");
      await api.post("/user/profile", submissionData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccess("Profil berhasil diperbarui.");
      await fetchUser(); // Ambil data user terbaru dari server
      setIsEditing(false);
    } catch (err: any) {
      showError(err.response?.data?.message || "Gagal memperbarui profil.");
    }
  };

  const ViewMode = () => (
    <CardContent className="space-y-2">
      <ProfileInfoRow icon={User} label="Nama Lengkap">
        <p>{user?.name || "-"}</p>
      </ProfileInfoRow>
      <ProfileInfoRow icon={Mail} label="Email">
        <div className="flex items-center gap-2">
          <p>{user?.email || "-"}</p>
          {user?.email_verified_at ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Terverifikasi
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" /> Belum Verifikasi
            </Badge>
          )}
        </div>
      </ProfileInfoRow>
      <ProfileInfoRow icon={Phone} label="Nomor Telepon">
        <p>{user?.phone_number || "Belum diatur"}</p>
      </ProfileInfoRow>
      <ProfileInfoRow icon={Cake} label="Tanggal Lahir">
        <p>
          {user?.date_of_birth
            ? format(parseISO(user.date_of_birth), "d MMMM yyyy", {
                locale: localeID,
              })
            : "-"}
        </p>
      </ProfileInfoRow>
      <ProfileInfoRow icon={VenetianMask} label="Gender">
        <p>{user?.gender || "-"}</p>
      </ProfileInfoRow>
    </CardContent>
  );

  const EditMode = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profilePicturePreview || ""}
                  alt={user?.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl bg-primary/20 text-primary font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "d MMMM yyyy", {
                                locale: localeID,
                              })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown" // <-- REVISI: Tambahkan ini
                          fromYear={1950} // <-- REVISI: Tentukan tahun awal
                          toYear={new Date().getFullYear()} // <-- REVISI: Tentukan tahun akhir
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1950-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancelClick}
            disabled={form.formState.isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Simpan Perubahan
          </Button>
        </CardFooter>
      </form>
    </Form>
  );

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div>
          <CardTitle>Detail Profil</CardTitle>
          <CardDescription>
            Informasi pribadi Anda. Pastikan data ini selalu akurat.
          </CardDescription>
        </div>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profil
          </Button>
        )}
      </CardHeader>
      {isEditing ? <EditMode /> : <ViewMode />}
    </Card>
  );
};
