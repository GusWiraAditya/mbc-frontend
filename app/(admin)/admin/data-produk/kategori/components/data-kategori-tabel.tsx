
'use client'

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, TriangleAlert } from "lucide-react"
import { DataTable } from "../../../data-table"
import { Category, getColumns } from "./kategori-columns"
import api from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CategoryForm } from "./kategori-form"
import { showError, showSuccess } from "@/lib/toast"
import PageSkeleton from "../../../skeleton";


// Fungsi untuk mengambil data kategori dari API
async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/admin/categories');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}



export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const categories = await getCategories();
    setData(categories);
    setIsLoading(false);
  }

  useEffect(() => {
    // Simulasikan loading agar skeleton terlihat
    setTimeout(() => loadData(), 500);
  }, []);

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  }

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  }

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      await api.delete(`/admin/categories/${selectedCategory.id}`);
      showSuccess("Kategori berhasil dihapus.");
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      showError("Gagal menghapus kategori.");
    }
  }

  const columns = useMemo(() => getColumns({ onEdit: handleEdit, onDelete: handleDelete }), []);

  // REVISI: Tampilkan skeleton loader saat isLoading
  if (isLoading) {
    return <PageSkeleton/>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 bg-neutral-50 p-4 rounded-md shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">Manajemen <span className="text-primary">Kategori</span></h1>
          <p className="text-muted-foreground pt-1 text-sm text-center md:text-left">Kelola semua kategori produk MadeByCan</p>
        </div>
        <Button onClick={handleAdd} className="w-full md:w-1/3 lg:w-1/5 md:mt-0 mt-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>
      <DataTable columns={columns} data={data} />

      {/* Dialog untuk Tambah/Edit Kategori */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
          </DialogHeader>
          <CategoryForm 
            initialData={selectedCategory}
            onSuccess={loadData} 
            onClose={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>


      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <TriangleAlert className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-lg">Apakah Anda Yakin Ingin Menghapus?</AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription className="pl-14" aria-describedby="delete_message">
            Tindakan ini tidak dapat diurungkan. Ini akan menghapus kategori
            <strong className="mx-1">"{selectedCategory?.category_name}"</strong>
            secara permanen
          </AlertDialogDescription>
          <AlertDialogFooter className="pl-14">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="text-white bg-destructive hover:bg-destructive/75"
            >
              Ya, Hapus Kategori
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}