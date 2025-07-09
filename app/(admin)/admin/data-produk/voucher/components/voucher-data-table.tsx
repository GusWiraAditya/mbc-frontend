"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, TriangleAlert } from "lucide-react";
import { DataTable } from "../../../components/data-table";
import { Voucher, getVoucherColumns } from "./voucher-columns";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VoucherForm } from "./voucher-form";
import { showError, showSuccess } from "@/lib/toast";
import PageSkeleton from "@/app/(admin)/admin/components/skeleton";

async function getVouchers(): Promise<Voucher[]> {
  try {
    const response = await api.get("/admin/vouchers");
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch vouchers:", error);
    showError("Gagal memuat data voucher.");
    return [];
  }
}

export default function VouchersDataTable() {
  const [data, setData] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const vouchers = await getVouchers();
    setData(vouchers);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setSelectedVoucher(null);
    setIsFormOpen(true);
  };
  const handleEdit = async (voucher: Voucher) => {
    try {
      // Anda bisa menambahkan state loading di sini jika perlu
      // setIsLoading(true);

      // 1. Panggil API untuk mendapatkan detail lengkap dari satu voucher
      const response = await api.get(`/admin/vouchers/${voucher.id}`);

      // 2. Gunakan data LENGKAP dari respons API untuk mengisi state
      setSelectedVoucher(response.data);

      // 3. Buka form setelah data lengkap diterima
      setIsFormOpen(true);
    } catch (err) {
      showError("Gagal mengambil data detail voucher.");
      console.error(err);
    } finally {
      // Set loading ke false jika Anda menggunakannya
      // setIsLoading(false);
    }
  };
  const handleDelete = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVoucher) return;
    try {
      await api.delete(`/admin/vouchers/${selectedVoucher.id}`);
      showSuccess("Voucher berhasil dihapus.");
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      showError("Gagal menghapus voucher.");
    }
  };

  const columns = useMemo(
    () => getVoucherColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    []
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 bg-neutral-50 p-4 rounded-md shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">
            Manajemen <span className="text-primary">Voucher</span>
          </h1>
          <p className="text-muted-foreground pt-1 text-sm text-center md:text-left">
            Buat dan kelola semua kode promo dan diskon Anda.
          </p>
        </div>
        <Button onClick={handleAdd} className="w-full md:w-auto mt-4 md:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Voucher
        </Button>
      </div>
      <DataTable columns={columns} data={data} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedVoucher ? "Edit Voucher" : "Tambah Voucher Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi detail voucher di bawah ini. Field akan berubah sesuai Tipe
              Voucher yang dipilih.
            </DialogDescription>
          </DialogHeader>
          <VoucherForm
            initialData={selectedVoucher}
            onSuccess={() => {
              setIsFormOpen(false);
              loadData();
            }}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <TriangleAlert className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-lg">
                Apakah Anda Yakin?
              </AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription className="pl-14">
            Tindakan ini akan menghapus voucher{" "}
            <strong className="mx-1 font-mono">
              "{selectedVoucher?.name}"
            </strong>{" "}
            dengan code{" "}
            <strong className="mx-1 font-mono">
              "{selectedVoucher?.code}"
            </strong>{" "}
            secara permanen.
          </AlertDialogDescription>
          <AlertDialogFooter className="pl-14">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
