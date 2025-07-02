// app/admin/produk/data-produk-table.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, TriangleAlert } from "lucide-react";
import { DataTable } from "../../../data-table"; // sesuaikan path jika perlu
import { Product, getProductColumns } from "./produk-columns";
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
import { ProductForm } from "./produk-form";
import { showError, showSuccess } from "@/lib/toast";
import PageSkeleton from "../../../skeleton";

async function getProducts(): Promise<Product[]> {
  try {
    const response = await api.get("/admin/products");
    return response.data;
  } catch (error) {
    console.error("Gagal memuat produk:", error);
    showError("Gagal memuat data produk.");
    return [];
  }
}

export default function ProductTable() {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const products = await getProducts();
    setData(products);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };
  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await api.delete(`/admin/products/${selectedProduct.id}`);
      showSuccess("Produk berhasil dihapus.");
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      showError("Gagal menghapus produk.");
    }
  };

  const columns = useMemo(
    () => getProductColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    []
  );

  if (isLoading) return <PageSkeleton />;

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 bg-neutral-50 p-4 rounded-md shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">
            Manajemen <span className="text-primary">Produk</span>
          </h1>
          <p className="text-muted-foreground pt-1 text-sm text-center md:text-left">
            Kelola semua produk MadeByCan
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="w-full md:w-1/3 lg:w-1/5 md:mt-0 mt-4"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>
      <DataTable columns={columns} data={data} exportFileName="products" />

      {/* --- DIALOG UNTUK FORM --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl md:max-w-6xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Edit Produk & Varian" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi detail produk di bawah ini. Anda bisa menambahkan beberapa
              varian dengan harga dan stok yang berbeda.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialData={selectedProduct}
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
                Apakah Anda Yakin Ingin Menghapus?
              </AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription
            className="pl-14"
            aria-describedby="delete_message"
          >
            Tindakan ini tidak dapat diurungkan. Ini akan menghapus produk
            <strong className="mx-1">"{selectedProduct?.product_name}"</strong>
            secara permanen beserta semua varian dan data terkait lainnya.
          </AlertDialogDescription>
          <AlertDialogFooter className="pl-14">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="text-white bg-destructive hover:bg-destructive/75"
            >
              Ya, Hapus Produk
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
