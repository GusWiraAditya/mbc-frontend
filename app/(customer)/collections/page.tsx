"use client";

// --- 1. IMPORTS ---
import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Komponen & Ikon
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Search, SlidersHorizontal } from "lucide-react";

// Data & utilitas
import api from "@/lib/api";
import { Product as ProductType } from "@/app/(admin)/admin/data-produk/produk/components/produk-columns";

// --- 2. CUSTOM HOOK DEBOUNCE (Tidak ada perubahan) ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- 3. TIPE DATA (Tidak ada perubahan) ---

// --- 4. KOMPONEN SKELETON (Tidak ada perubahan) ---
type MasterData = {
  categories: { id: number; category_name: string; slug: string }[];
  colors: { id: number; name: string; hex_code: string }[];
  materials: { id: number; name: string }[];
};
// Tipe ini sudah disesuaikan dengan struktur asli dari Laravel Paginate
type PaginatedResponse = {
  data: ProductType[];
  links: { url: string | null; label: string; active: boolean }[];
  current_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

// --- 4. KOMPONEN SKELETON ---
const FilterSkeleton = () => (
  <div className="space-y-6">
       {" "}
    {[...Array(4)].map((_, i) => (
      <div className="space-y-3" key={i}>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-16 w-full" />     {" "}
      </div>
    ))}
     {" "}
  </div>
);
const ProductCardSkeleton = () => (
  <div className="space-y-2">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <Skeleton className="h-6 w-3/4 mt-4" />
        <Skeleton className="h-5 w-1/2" /> {" "}
  </div>
);
// --- 5. KOMPONEN UTAMA (Revisi Total) ---
function CollectionsComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- State Management ---
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [productsResponse, setProductsResponse] =
    useState<PaginatedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("min_price")) || 0,
    Number(searchParams.get("max_price")) || 5000000,
  ]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- Handlers & Logic ---
  const createQueryString = useCallback(
    (params: Record<string, any>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        )
          newParams.delete(key);
        else
          newParams.set(
            key,
            Array.isArray(value) ? value.join(",") : String(value)
          );
      });
      return newParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    api
      .get("/shop/filters")
      .then((res) => setMasterData(res.data))
      .catch((err) => console.error("Failed to fetch master data:", err));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const queryString = searchParams.toString();
    api
      .get(`/shop/products?${queryString}`)
      .then((res) => setProductsResponse(res.data))
      .catch((err) => console.error("Gagal mengambil produk:", err))
      .finally(() => setIsLoading(false));
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearchTerm !== currentSearch) {
      const newQuery = createQueryString({
        search: debouncedSearchTerm,
        page: "1",
      });
      router.push(`${pathname}?${newQuery}`, { scroll: false });
    }
  }, [debouncedSearchTerm, createQueryString, pathname, router, searchParams]);

  const handleCheckboxChange = (
    key: "categories" | "genders" | "colors" | "materials",
    value: string
  ) => {
    const currentValues = searchParams.get(key)?.split(",") || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    const newQuery = createQueryString({ [key]: newValues, page: "1" });
    router.push(`${pathname}?${newQuery}`, { scroll: false });
  };

  const handleSortChange = (value: string) => {
    const newQuery = createQueryString({ sort_by: value, page: "1" });
    router.push(`${pathname}?${newQuery}`, { scroll: false });
  };

  const handlePriceCommit = (value: [number, number]) => {
    const newQuery = createQueryString({
      min_price: value[0],
      max_price: value[1],
      page: "1",
    });
    router.push(`${pathname}?${newQuery}`, { scroll: false });
  };

  const clearFilters = () => router.push(pathname);

  const currentFilters = useMemo(
    () => ({
      categories: searchParams.get("categories")?.split(",") || [],
      colors: searchParams.get("colors")?.split(",") || [],
      materials: searchParams.get("materials")?.split(",") || [],
      genders: searchParams.get("genders")?.split(",") || [],
      sortBy: searchParams.get("sort_by") || "newest",
    }),
    [searchParams]
  );

  const hasProducts =
    !isLoading &&
    productsResponse &&
    productsResponse.data &&
    productsResponse.data.length > 0;

  // Komponen untuk Sidebar Filter, agar bisa digunakan di desktop dan mobile drawer
  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b">
        <h2 className="text-xl font-semibold">Filter</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-sm"
        >
          Reset
        </Button>
      </div>
      {!masterData ? (
        <FilterSkeleton />
      ) : (
        <>
          <div>
            <h3 className="font-semibold text-lg mb-3">Categories</h3>
            <div className="space-y-1">
              {masterData.categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 text-sm p-1 cursor-pointer hover:bg-muted rounded"
                >
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={currentFilters.categories.includes(String(cat.id))}
                    onCheckedChange={() =>
                      handleCheckboxChange("categories", String(cat.id))
                    }
                  />
                  {cat.category_name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Price</h3>
            <Slider
              value={priceRange}
              max={5000000}
              step={100000}
              onValueChange={(value) =>
                setPriceRange(value as [number, number])
              }
              onValueCommit={handlePriceCommit}
            />
            <div className="flex justify-between text-xs mt-2 text-muted-foreground">
              <span>Rp {priceRange[0].toLocaleString("id-ID")}</span>
              <span>Rp {priceRange[1].toLocaleString("id-ID")}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {masterData.colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() =>
                    handleCheckboxChange("colors", String(color.id))
                  }
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    currentFilters.colors.includes(String(color.id))
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color.hex_code }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Materials</h3>
            <div className="space-y-1">
              {masterData.materials.map((mat) => (
                <label
                  key={mat.id}
                  className="flex items-center gap-2 text-sm p-1 cursor-pointer hover:bg-muted rounded"
                >
                  <Checkbox
                    id={`mat-${mat.id}`}
                    checked={currentFilters.materials.includes(String(mat.id))}
                    onCheckedChange={() =>
                      handleCheckboxChange("materials", String(mat.id))
                    }
                  />
                  {mat.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Gender</h3>
            <div className="space-y-1">
              {["unisex", "men", "women"].map((gender) => (
                <label
                  key={gender}
                  className="flex items-center gap-2 text-sm p-1 cursor-pointer hover:bg-muted rounded"
                >
                  <Checkbox
                    id={`gen-${gender}`}
                    checked={currentFilters.genders.includes(gender)}
                    onCheckedChange={() =>
                      handleCheckboxChange("genders", gender)
                    }
                  />
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* HERO */}
      <section
        className="relative h-[550px] bg-fixed bg-cover bg-center flex items-center justify-center px-6 md:px-20"
        style={{
          backgroundImage: `linear-gradient(rgba(109,78,46,0.8), rgba(109,78,46,0.8)), url(/background/bg-collections.jpeg)`,
        }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl text-white text-center mt-20"
        >
          <h1 className="text-3xl md:text-5xl font-bold">
            <span className="block">Grab Up to 50% Off On</span>
            <span className="block mt-4">Selected Bag</span>
          </h1>
        </motion.div>
      </section>

      <section className="px-6 md:px-20 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between mb-6 gap-4">
          <div className="flex gap-2 items-center self-end md:self-auto w-full md:w-auto justify-between">
            <div className="relative w-full md:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                className="border rounded-md pl-10 pr-4 py-2 w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="h-4 w-4" /> Filter
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="p-4 overflow-y-auto">
                    <DrawerHeader>
                      <DrawerTitle>Filter Produk</DrawerTitle>
                    </DrawerHeader>
                    <FilterContent />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
          <RadioGroup
            onValueChange={handleSortChange}
            value={currentFilters.sortBy}
            className="flex gap-2 border p-1 rounded-md justify-center items-center"
          >
            <RadioGroupItem value="newest" id="newest" className="sr-only" />
            <Label
              htmlFor="newest"
              className={`text-sm px-3 py-1 rounded-md cursor-pointer transition-colors ${
                currentFilters.sortBy === "newest"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Terbaru
            </Label>
            <RadioGroupItem
              value="price_asc"
              id="price_asc"
              className="sr-only"
            />
            <Label
              htmlFor="price_asc"
              className={`text-sm px-3 py-1 rounded-md cursor-pointer transition-colors ${
                currentFilters.sortBy === "price_asc"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Price: Low to High
            </Label>
            <RadioGroupItem
              value="price_desc"
              id="price_desc"
              className="sr-only"
            />
            <Label
              htmlFor="price_desc"
              className={`text-sm px-3 py-1 rounded-md cursor-pointer transition-colors ${
                currentFilters.sortBy === "price_desc"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Price: High to Low
            </Label>
          </RadioGroup>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block sticky top-28 w-72 max-h-[calc(100vh-140px)] overflow-y-auto shrink-0 p-4 bg-white rounded-md">
            <FilterContent />
          </aside>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {Array.from({ length: 9 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </motion.div>
              )}
              {hasProducts && productsResponse && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    Menampilkan {productsResponse.from}-{productsResponse.to}{" "}
                    dari {productsResponse.total} produk
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                    {productsResponse.data.map((product) => {
                      const { min_price, max_price } = product;

                      // 2. Buat fungsi helper untuk format
                      const format = (val: number) =>
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(val);

                      // 3. Tentukan tampilan harga secara dinamis
                      let displayPrice: string;
                      if (min_price && max_price && min_price > 0) {
                        if (min_price === max_price) {
                          // Jika harga min dan max sama, tampilkan satu harga
                          displayPrice = format(min_price);
                        } else {
                          // Jika berbeda, tampilkan sebagai rentang
                          displayPrice = `${format(min_price)} - ${format(
                            max_price
                          )}`;
                        }
                      } else {
                        // Fallback jika tidak ada harga
                        displayPrice = "Lihat Detail";
                      }

                      const imageUrl = product.variants[0]?.images[0]?.path;
                      const publicImageUrl = imageUrl
                        ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${imageUrl}`
                        : "/placeholder.png";

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            className="flex flex-col h-full cursor-pointer group"
                          >
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                              <Image
                                src={publicImageUrl}
                                alt={product.product_name}
                                fill
                                style={{ objectFit: "cover" }}
                                className="transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 33vw"
                              />
                            </div>
                            <div className="flex flex-col flex-grow mt-4">
                              <h4
                                className="text-black text-base font-semibold line-clamp-2"
                                style={{ minHeight: "2.5rem" }}
                              >
                                {product.product_name}
                              </h4>
                            </div>
                            {/* Tampilkan harga yang sudah diformat */}
                            <p className="text-gray-800 text-lg font-medium mt-2">
                              {displayPrice}
                            </p>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  <Pagination className="mt-12">
                    <PaginationContent className="space-x-1.5">
                      {productsResponse.links.map((link, index) => (
                        <PaginationItem key={index}>
                          {" "}
                          {link.url ? (
                            <PaginationLink
                              href={`${pathname}?${link.url.split("?")[1]}`}
                              isActive={link.active}
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          ) : (
                            <PaginationEllipsis />
                          )}{" "}
                        </PaginationItem>
                      ))}
                    </PaginationContent>
                  </Pagination>
                </motion.div>
              )}
              {!isLoading && !hasProducts && (
                <motion.div
                  key="no-data"
                  className="text-center py-20 col-span-full"
                >
                  <h3 className="text-xl font-semibold">
                    Produk Tidak Ditemukan
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Coba sesuaikan filter Anda atau reset pencarian.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}

export default function CollectionsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-full">
          Memuat Halaman Koleksi...
        </div>
      }
    >
      <CollectionsComponent />
    </Suspense>
  );
}
