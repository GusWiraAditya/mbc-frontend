"use client";

// --- 1. IMPORTS ---
import { useEffect, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Komponen & Ikon
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

// Data & utilitas
import api from "@/lib/api";

// --- 2. TIPE DATA LENGKAP (SUMBER KEBENARAN TUNGGAL) ---
type Category = {
  id: number;
  slug: string;
  category_name: string;
  description?: string;
};
type Color = {
  id: number;
  name: string;
  hex_code: string;
};
type Size = {
  id: number;
  name: string;
  code: string;
  description?: string;
};
type Material = {
  id: number;
  name: string;
  description?: string;
};
type ProductImage = {
  id: number;
  path: string;
};
type ProductVariant = {
  id: number;
  sku: string | null;
  price: number;
  stock: number;
  color: Color;
  size: Size;
  material: Material;
  images: ProductImage[];
};
type Product = {
  id: number;
  slug: string;
  product_name: string;
  description?: string;
  category: Category;
  variants: ProductVariant[];
  min_price?: number;
  max_price?: number;
};


// --- 3. KOMPONEN SKELETON ---
const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-10 pt-32 grid md:grid-cols-2 gap-12">
    <div className="space-y-4">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="w-20 h-20 rounded-md" />
        <Skeleton className="w-20 h-20 rounded-md" />
        <Skeleton className="w-20 h-20 rounded-md" />
      </div>
    </div>
    <div className="space-y-6">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-4 pt-4"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      <div className="space-y-4"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-10 w-full" /></div>
      <Skeleton className="h-12 w-48" />
    </div>
  </div>
);

// --- 4. KOMPONEN UTAMA ---
function ProductDetailComponent() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  // --- REVISI 1: State baru untuk melacak gambar utama ---
  const [mainImage, setMainImage] = useState<ProductImage | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const productRes = await api.get(`/products/${slug}`);
        const productData: Product = productRes.data;
        setProduct(productData);

        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
        
        const relatedRes = await api.get(`/products/${slug}/related`);
        setRelatedProducts(relatedRes.data);
      } catch (err) {
        setError("Produk tidak ditemukan.");
        console.error("Gagal mengambil data produk:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

   // --- REVISI 2: useEffect untuk sinkronisasi gambar saat varian berubah ---
  useEffect(() => {
    // Setiap kali `selectedVariant` berubah (karena user ganti warna),
    // reset gambar utama ke gambar pertama dari varian baru tersebut.
    if (selectedVariant && selectedVariant.images.length > 0) {
      setMainImage(selectedVariant.images[0]);
    }
  }, [selectedVariant]);

  const uniqueColors = useMemo(() => 
    product ? [...new Map(product.variants.map(v => [v.color.id, v.color])).values()] : [],
  [product]);

  const handleColorSelect = (colorId: number) => {
    const newVariant = product?.variants.find(v => v.color.id === colorId);
    if (newVariant) setSelectedVariant(newVariant);
  };

  const formattedPrice = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(selectedVariant?.price || 0);

  if (isLoading) return <ProductDetailSkeleton />;
  if (error) return <div className="flex items-center justify-center h-[50vh] text-destructive">{error}</div>;
  if (!product) return null;

  return (
    <div className="pt-24">
      <div className="container mx-auto px-4 py-10">
        
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/collections">Collections</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/collections?categories=${product.category.id}`}>{product.category.category_name}</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{product.product_name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Kolom Kiri: Galeri Gambar */}
          <div className="space-y-4">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
              <AnimatePresence mode="wait">
                <motion.div
                  // Key diubah menjadi mainImage.id agar animasi berjalan saat gambar berganti
                  key={mainImage?.id || 'placeholder'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <Image
                    // REVISI 3: Sumber gambar utama sekarang dari state `mainImage`
                    src={mainImage?.path ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${mainImage.path}` : '/placeholder.png'}
                    alt={product.product_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {/* REVISI 4: Thumbnail sekarang interaktif */}
              {selectedVariant?.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setMainImage(image)}
                  className={cn(
                    "relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200",
                    mainImage?.id === image.id ? "border-primary ring-2 ring-primary/50" : "border-transparent hover:border-primary/50"
                  )}
                >
                   <Image src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${image.path}`} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
          
          {/* Kolom Kanan: Info & Aksi Produk */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">{product.product_name}</h1>
              <p className="text-2xl font-semibold text-gray-800">{formattedPrice}</p>
            </div>
            <Separator />
            
            <div>
              <h3 className="text-md font-semibold mb-3">Colors: <span className="font-normal text-muted-foreground">{selectedVariant?.color.name}</span></h3>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map(color => (
                  <button key={color.id} onClick={() => handleColorSelect(color.id)}
                    className={cn(
                      "h-10 w-10 rounded-full border-2 transition-all",
                      selectedVariant?.color.id === color.id ? 'ring-2 ring-offset-2 ring-primary' : 'border-gray-200 hover:scale-110'
                    )}
                    style={{backgroundColor: color.hex_code}} title={color.name}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-semibold mb-2">Sizes:</h3>
              <div className="flex items-center">
                <div className="border rounded-md px-4 py-2 text-sm bg-muted text-muted-foreground">{selectedVariant?.size.name || '-'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-semibold mb-2">Materials:</h3>
               <div className="flex items-center">
                <div className="border rounded-md px-4 py-2 text-sm bg-muted text-muted-foreground">{selectedVariant?.material.name || '-'}</div>
              </div>
            </div>
            
            <Separator />
            <div className="flex items-center gap-4 pt-2">
               <Button size="lg" disabled={!selectedVariant || selectedVariant.stock === 0} className="w-full md:w-auto">
                  {selectedVariant && selectedVariant.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
               </Button>
               <div className="text-sm text-muted-foreground">Stock: {selectedVariant?.stock || 0}</div>
            </div>
            
            <Accordion type="multiple" className="w-full" defaultValue={['item-1']}>
              <AccordionItem value="item-1">
                <AccordionTrigger>Product Description</AccordionTrigger>
                <AccordionContent className="text-muted-foreground prose prose-sm max-w-none space-y-4">
                  <p>{product.description || 'Informasi produk tidak tersedia.'}</p>
                  {product.category.description && (
                    <div className="text-xs border-t pt-2 mt-4">
                        <p className="font-semibold text-gray-600">About Category {product.category.category_name}:</p>
                        <p>{product.category.description}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              {selectedVariant?.material.description && (
                <AccordionItem value="item-2">
                  <AccordionTrigger>Material Detail</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground prose prose-sm max-w-none">
                    <p>{selectedVariant.material.description}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
              {selectedVariant?.size.description && (
                <AccordionItem value="item-3">
                  <AccordionTrigger>Size Guide</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground prose prose-sm max-w-none">
                    <p>{selectedVariant.size.description}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
         <section className="bg-muted py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8 text-primary">You might also like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(related => {
                  const displayPrice = related.min_price && related.max_price && related.min_price > 0 
                    ? (related.min_price === related.max_price ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(related.min_price) : `Start From: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(related.min_price)}`)
                    : 'Prices Vary';
                  const imageUrl = related.variants[0]?.images[0]?.path;
                  return (
                     <div key={related.id}>
                        <Link href={`/products/${related.slug}`} className="group">
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100"><Image src={imageUrl ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${imageUrl}` : '/placeholder.png'} alt={related.product_name} fill className="object-cover transition-transform group-hover:scale-105" /></div>
                            <h3 className="mt-2 font-semibold text-md text-gray-800 line-clamp-2">{related.product_name}</h3>
                            <p className="text-sm text-muted-foreground">{displayPrice}</p>
                        </Link>
                     </div>
                  )
                })}
              </div>
            </div>
         </section>
      )}
    </div>
  );
}

// Komponen wrapper untuk Suspense
export default function ProductDetailPageWrapper() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailComponent />
    </Suspense>
  );
}