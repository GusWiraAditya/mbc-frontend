"use client";

// --- 1. IMPORTS ---
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";

// Komponen & Ikon (Kita butuh lebih banyak dari shadcn/ui)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MapPin, ShieldCheck, Plus, MoreVertical, CheckCircle2, AlertTriangle, Home, Building, Trash2, Package, Star, LogOut } from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

// Tipe Data
type Address = {
    id: number;
    label: string;
    recipient_name: string;
    phone_number: string;
    province_name: string;
    city_name: string;
    subdistrict_name: string;
    address_detail: string;
    postal_code?: string;
    is_primary: boolean;
};

// =====================================================================
// BAGIAN 1: SUB-KOMPONEN "WIDGET" UNTUK DASHBOARD
// =====================================================================

/**
 * Widget Header: Menyambut pengguna dan menampilkan avatar.
 */
const WelcomeHeader = ({ user, onLogout }: { user: any, onLogout: () => void }) => (
    <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Akun Saya</h1>
            <p className="text-muted-foreground">Selamat datang kembali, {user?.name}!</p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                    <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/20 items-center justify-center">
                        <span className="font-bold text-primary">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);

/**
 * Widget Kartu Statistik: Komponen reusable untuk menampilkan data kunci.
 */
const StatCard = ({ icon: Icon, title, value, description }: { icon: React.ElementType, title: string, value: string, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

/**
 * Widget Alamat Utama: Menampilkan preview alamat utama dan tombol untuk mengelola.
 */
const PrimaryAddressCard = ({ address, onManageClick }: { address: Address | null; onManageClick: () => void }) => (
    <Card className="lg:col-span-2">
        <CardHeader>
            <CardTitle>Alamat Utama</CardTitle>
            <CardDescription>Ini adalah alamat default untuk pengiriman pesanan Anda.</CardDescription>
        </CardHeader>
        <CardContent>
            {address ? (
                <div>
                    <p className="font-semibold">{address.recipient_name} ({address.label})</p>
                    <p className="text-sm text-muted-foreground">{address.phone_number}</p>
                    <p className="text-sm text-muted-foreground mt-2">{address.address_detail}, {address.city_name}, {address.province_name}</p>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Anda belum mengatur alamat utama.</p>
            )}
        </CardContent>
        <CardFooter>
            <Button variant="outline" onClick={onManageClick}>Kelola Semua Alamat</Button>
        </CardFooter>
    </Card>
);

// =====================================================================
// BAGIAN 2: KOMPONEN MANAJEMEN (DI DALAM SHEET & DIALOG)
// =====================================================================

/**
 * Komponen untuk menampilkan daftar alamat di dalam Sheet.
 */
const AddressList = ({ onAction }: { onAction: () => void }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAddresses = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
        } catch (err) {
            showError("Gagal memuat daftar alamat.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // TODO: Buat komponen AddressForm terpisah untuk menambah/edit alamat
    // const [isFormOpen, setIsFormOpen] = useState(false);
    // const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button><Plus className="h-4 w-4 mr-2"/> Tambah Alamat Baru</Button>
            </div>
            {/* {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : addresses.length > 0 ? (
                <div className="space-y-4">
                    {addresses.map(address => <AddressCard key={address.id} address={address} onAction={fetchAddresses} />)}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Anda belum memiliki alamat tersimpan.</p>
                </div>
            )} */}
        </div>
    );
};

// ... (Komponen AddressCard, ProfileSection, SecuritySection tetap sama seperti sebelumnya) ...
const AddressCard = ({ address, onAction }: { address: Address; onAction: () => void }) => { /* ... kode ... */ };

// =====================================================================
// BAGIAN 3: KOMPONEN UTAMA (THE DASHBOARD)
// =====================================================================

export default function MyAccountPage() {
    const { user, isInitialized, logout } = useAuthStore();
    const router = useRouter();
    const [primaryAddress, setPrimaryAddress] = useState<Address | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = async () => {
        await logout();
        router.push('/'); // Arahkan ke homepage setelah logout
    };

    useEffect(() => {
        if (isInitialized && user) {
            const fetchInitialData = async () => {
                setIsLoading(true);
                try {
                    // Ambil semua alamat, lalu cari yang utama
                    const response = await api.get('/addresses');
                    const primary = response.data.find((addr: Address) => addr.is_primary) || response.data[0] || null;
                    setPrimaryAddress(primary);
                } catch (err) {
                    console.error("Gagal memuat data awal akun:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [isInitialized, user]);

    if (!isInitialized || isLoading) {
        return (
            <div className="container mx-auto px-4 py-10 pt-32 animate-pulse">
                <div className="flex justify-between items-center mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-10 pt-32">
                <WelcomeHeader user={user} onLogout={handleLogout} />

                {/* Grid Statistik Utama */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatCard icon={Package} title="Total Pesanan" value="12" description="2 pesanan dalam 30 hari terakhir" />
                    <StatCard icon={Star} title="Poin Loyalitas" value="1,250" description="Dapatkan dari setiap pembelian" />
                    <StatCard icon={MapPin} title="Alamat Tersimpan" value="3" description="1 alamat utama diatur" />
                    <StatCard icon={ShieldCheck} title="Status Akun" value="Terverifikasi" description="Email & No. Telepon aman" />
                </div>

                {/* Grid Widget Utama */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <PrimaryAddressCard 
                        address={primaryAddress} 
                        onManageClick={() => { /* Logika untuk membuka sheet */ }}
                    />
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Keamanan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full" onClick={() => router.push('/profile/security')}>Ubah Kata Sandi & Keamanan</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* REVISI: Manajemen Alamat sekarang ada di dalam Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        {/* Tombol ini bisa disembunyikan dan dipicu secara programatik */}
                        <button id="manage-address-trigger" className="hidden">Kelola Alamat</button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Buku Alamat Anda</SheetTitle>
                            <SheetDescription>
                                Tambah, edit, atau hapus alamat pengiriman Anda.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-4">
                            <AddressList onAction={() => { /* refresh primaryAddress */ }} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
