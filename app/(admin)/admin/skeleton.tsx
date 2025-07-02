import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => (
  <div className="space-y-6">
    {/* Skeleton untuk Header Halaman */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-36 mt-4 md:mt-0" />
    </div>

    <div className="space-y-4">
      {/* Skeleton untuk Toolbar DataTable */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Skeleton untuk Tabel */}
      <div className="rounded-md border">
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
              <Skeleton className="h-10 w-10 rounded-md mr-4" /> {/* Gambar */}
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

export default PageSkeleton;