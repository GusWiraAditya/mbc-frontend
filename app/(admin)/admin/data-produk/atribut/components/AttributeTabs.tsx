"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttributeDataTable } from "./AttributeDataTable";
import { getColorColumns, getSizeColumns, getMaterialColumns } from "./atribut-columns";
import api from "@/lib/api";

// Tipe data untuk atribut
export type Attribute = {
  id: number;
  name: string;
  code?: string | null; // 'code' bisa berupa hex_code atau singkatan
  hex_code?: string | null; // Spesifik untuk warna
  description?: string | null
};

export function AttributeTabs() {
  return (
    <>
    <div className="flex flex-col md:flex-row items-center justify-between mb-4 bg-neutral-50 p-4 rounded-md shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">
            Manajemen <span className="text-primary">Atribut</span>
          </h1>
          <p className="text-muted-foreground pt-1 text-sm text-center md:text-left">
            Kelola semua atribut untuk produk MadeByCan
          </p>
        </div>
      </div>
    <Tabs defaultValue="colors" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="colors">Warna</TabsTrigger>
        <TabsTrigger value="sizes">Ukuran</TabsTrigger>
        <TabsTrigger value="materials">Bahan</TabsTrigger>
      </TabsList>
      <TabsContent value="colors">
        <AttributeDataTable
          attributeName="Color"
          columns={getColorColumns}
          fetchData={async () => (await api.get('/admin/colors')).data}
          deleteData={async (id) => await api.delete(`/admin/colors/${id}`)}
          createData={async (data) => await api.post('/admin/colors', data)}
          updateData={async (id, data) => await api.put(`/admin/colors/${id}`, data)}
        />
      </TabsContent>
      <TabsContent value="sizes">
        <AttributeDataTable
          attributeName="Size"
          columns={getSizeColumns}
          fetchData={async () => (await api.get('/admin/sizes')).data}
          deleteData={async (id) => await api.delete(`/admin/sizes/${id}`)}
          createData={async (data) => await api.post('/admin/sizes', data)}
          updateData={async (id, data) => await api.put(`/admin/sizes/${id}`, data)}
        />
      </TabsContent>
      <TabsContent value="materials">
        <AttributeDataTable
          attributeName="Material"
          columns={getMaterialColumns}
          fetchData={async () => (await api.get('/admin/materials')).data}
          deleteData={async (id) => await api.delete(`/admin/materials/${id}`)}
          createData={async (data) => await api.post('/admin/materials', data)}
          updateData={async (id, data) => await api.put(`/admin/materials/${id}`, data)}
        />
      </TabsContent>
    </Tabs>
    </>
  );
}