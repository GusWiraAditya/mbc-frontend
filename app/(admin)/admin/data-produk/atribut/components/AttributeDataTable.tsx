"use client";

import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../components/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { AttributeForm } from "./AttributeForm";
import { Attribute } from "./AttributeTabs";
import { showError, showSuccess } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface AttributeDataTableProps {
  attributeName: string;
  columns: (handlers: {
    onEdit: (attr: Attribute) => void;
    onDelete: (attr: Attribute) => void;
  }) => ColumnDef<Attribute>[];
  fetchData: () => Promise<Attribute[]>;
  createData: (data: Partial<Attribute>) => Promise<any>;
  updateData: (id: number, data: Partial<Attribute>) => Promise<any>;
  deleteData: (id: number) => Promise<any>;
}

export function AttributeDataTable({
  attributeName,
  columns: getColumns,
  fetchData,
  createData,
  updateData,
  deleteData,
}: AttributeDataTableProps) {
  const [data, setData] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null
  );

  const loadData = async () => {
    setIsLoading(true);
    const fetchedData = await fetchData();
    setData(fetchedData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [fetchData]);

  const handleAdd = () => {
    setSelectedAttribute(null);
    setIsFormOpen(true);
  };
  const handleEdit = (attr: Attribute) => {
    setSelectedAttribute(attr);
    setIsFormOpen(true);
  };
  const handleDelete = (attr: Attribute) => {
    setSelectedAttribute(attr);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAttribute) return;
    try {
      await deleteData(selectedAttribute.id);
      showSuccess(`${attributeName} berhasil dihapus.`);
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      showError(`Gagal menghapus ${attributeName}.`);
    }
  };

  const handleFormSubmit = async (formData: Partial<Attribute>) => {
    try {
      if (selectedAttribute) {
        await updateData(selectedAttribute.id, formData);
        showSuccess(`${attributeName} berhasil diperbarui.`);
      } else {
        await createData(formData);
        showSuccess(`${attributeName} berhasil ditambahkan.`);
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      showError(`Gagal menyimpan ${attributeName}.`);
    }
  };

  const columns = useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [getColumns]
  );

  if (isLoading) {
    return (
      <div className="space-y-6 rounded-md border p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Skeleton className="h-10 w-40" />
          </div>
          {/* Skeleton untuk Toolbar DataTable */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Skeleton untuk Tabel */}
          <div className="rounded-md">
            <div className="divide-y">
              {/* Header Tabel */}
              <div className="flex items-center p-4">
                <Skeleton className="h-5 w-8 mr-4" /> {/* No. */}
                <Skeleton className="h-5 w-12 mr-4" /> {/* Gambar */}
                <Skeleton className="h-5 w-1/3 mr-4" /> {/* Nama */}
                <Skeleton className="h-5 w-1/5 mr-4" /> {/* Kategori */}
                <Skeleton className="h-5 w-1/6" /> {/* Harga */}
              </div>
              {/* Baris Data Tabel */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center p-4">
                  <Skeleton className="h-5 w-8 mr-4" /> {/* No. */}
                  <Skeleton className="h-10 w-10 rounded-md mr-4" />{" "}
                  {/* Gambar */}
                  <Skeleton className="h-5 w-1/3 mr-4" /> {/* Nama */}
                  <Skeleton className="h-5 w-1/5 mr-4" /> {/* Kategori */}
                  <Skeleton className="h-5 w-1/6" /> {/* Harga */}
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton untuk Paginasi DataTable */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center justify-end mb-4">
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah {attributeName}
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data}
          exportFileName={attributeName.toLowerCase()}
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAttribute
                  ? `Edit ${attributeName}`
                  : `Tambah ${attributeName} Baru`}
              </DialogTitle>
            </DialogHeader>
            <AttributeForm
              attributeName={attributeName}
              initialData={selectedAttribute}
              onSubmit={handleFormSubmit}
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
            <AlertDialogDescription className="pl-14" aria-describedby="delete_message">
              Tindakan ini tidak dapat diurungkan. Ini akan menghapus{" "}
              {attributeName}
              <strong className="mx-1">"{selectedAttribute?.name}"</strong>
              secara permanen
            </AlertDialogDescription>
            <AlertDialogFooter className="pl-14">
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="text-white bg-destructive hover:bg-destructive/75"
              >
                Ya, Hapus {attributeName}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
