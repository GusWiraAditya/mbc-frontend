"use client";

// --- 1. IMPORTS ---
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Komponen & Ikon
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingCart, Loader2, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";

// Data & utilitas
import api from "@/lib/api";
import { showError } from "@/lib/toast";
import { useProductVariants } from "@/lib/hooks/useProductVariants";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  Product,
  ProductVariant,
  ProductImage,
  Color,
  Size,
  Material,
  Category,
} from "@/lib/types/product"; // <-- Impor dari file terpusat

// =====================================================================
// BAGIAN 1: SUB-KOMPONEN YANG FOKUS
// =====================================================================

/**
 * Sub-komponen yang hanya bertanggung jawab untuk menampilkan galeri gambar.
 */
const ImageGallery = ({
  mainImage,
  selectedVariant,
  setMainImage,
  productName,
}: {
  mainImage: ProductImage | null;
  selectedVariant: ProductVariant | null;
  setMainImage: (image: ProductImage) => void;
  productName: string;
}) => (
  <div className="space-y-4">
    <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted">
      <AnimatePresence mode="wait">
        <motion.div
          key={mainImage?.id || "placeholder"}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          <Image
            src={
              mainImage?.path
                ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${mainImage.path}`
                : "/placeholder.png"
            }
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </motion.div>
      </AnimatePresence>
    </div>
    <div className="grid grid-cols-5 gap-2">
      {selectedVariant?.images.map((image) => (
        <button
          key={image.id}
          onClick={() => setMainImage(image)}
          className={cn(
            "relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200",
            mainImage?.id === image.id
              ? "border-primary ring-2 ring-primary/50"
              : "border-transparent hover:border-primary/50"
          )}
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${image.path}`}
            alt={`Thumbnail ${image.id}`}
            fill
            className="object-cover"
          />
        </button>
      ))}
    </div>
  </div>
);

/**
 * Sub-komponen yang hanya bertanggung jawab untuk menampilkan pilihan varian.
 */
const VariantSelector = ({
  selectedVariant,
  uniqueColors,
  uniqueSizes,
  uniqueMaterials,
  availableSizes,
  availableMaterials,
  handleColorSelect,
  handleSizeSelect,
  handleMaterialSelect,
}: {
  selectedVariant: ProductVariant | null;
  uniqueColors: Color[];
  uniqueSizes: Size[];
  uniqueMaterials: Material[];
  availableSizes: Size[];
  availableMaterials: Material[];
  handleColorSelect: (id: number) => void;
  handleSizeSelect: (id: number) => void;
  handleMaterialSelect: (id: number) => void;
}) => (
  <div className="space-y-5">
    {/* Warna */}
    <div>
      <Label className="text-md font-semibold mb-3 block">
        Warna:{" "}
        <span className="font-normal text-muted-foreground">
          {selectedVariant?.color.name}
        </span>
      </Label>
      <div className="flex flex-wrap gap-3">
        {uniqueColors.map((color) => (
          <button
            key={color.id}
            onClick={() => handleColorSelect(color.id)}
            className={cn(
              "h-8 w-8 rounded-full border-2 transition-all",
              selectedVariant?.color.id === color.id
                ? "ring-2 ring-offset-2 ring-primary"
                : "border-gray-200 hover:scale-110"
            )}
            style={{ backgroundColor: color.hex_code }}
            title={color.name}
          />
        ))}
      </div>
    </div>
    {/* Ukuran */}
    <div>
      <Label className="text-md font-semibold mb-2 block">Ukuran:</Label>
      <div className="flex flex-wrap gap-2">
        {uniqueSizes.map((size) => {
          const isAvailable = availableSizes.some((s) => s.id === size.id);
          return (
            <Button
              key={size.id}
              variant={
                selectedVariant?.size.id === size.id ? "default" : "outline"
              }
              onClick={() => handleSizeSelect(size.id)}
              disabled={!isAvailable}
            >
              {size.name}
            </Button>
          );
        })}
      </div>
    </div>
    {/* Material */}
    <div>
      <Label className="text-md font-semibold mb-2 block">Material:</Label>
      <div className="flex flex-wrap gap-2">
        {uniqueMaterials.map((material) => {
          const isAvailable = availableMaterials.some(
            (m) => m.id === material.id
          );
          return (
            <Button
              key={material.id}
              variant={
                selectedVariant?.material.id === material.id
                  ? "default"
                  : "outline"
              }
              onClick={() => handleMaterialSelect(material.id)}
              disabled={!isAvailable}
            >
              {material.name}
            </Button>
          );
        })}
      </div>
    </div>
  </div>
);

/**
 * Sub-komponen untuk aksi pembelian: kuantitas dan tombol Add to Cart.
 */
const PurchaseActions = ({
  selectedVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
}: {
  selectedVariant: ProductVariant | null;
  quantity: number;
  onQuantityChange: (amount: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}) => {
  const { isLoading: isCartLoading } = useCartStore();
  const isActionDisabled =
    !selectedVariant || selectedVariant.stock === 0 || isCartLoading;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
        {/* Kontrol Kuantitas */}
        <div className="flex items-center border rounded-md w-fit shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onQuantityChange(-1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onQuantityChange(1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Tombol Aksi */}
        <div className="w-full grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="outline"
            disabled={isActionDisabled}
            onClick={onAddToCart}
          >
            {isCartLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-5 w-5" />
            )}
            Keranjang
          </Button>
          <Button size="lg" disabled={isActionDisabled} onClick={onBuyNow}>
            {isCartLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Zap className="mr-2 h-5 w-5" />
            )}
            Beli Sekarang
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Stok Tersedia:{" "}
        {selectedVariant?.stock ?? "Pilih varian untuk melihat stok"}
      </div>
    </>
  );
};

// =====================================================================
// BAGIAN 2: KOMPONEN UTAMA YANG SUDAH BERSIH (THE ORCHESTRATOR)
// =====================================================================

function ProductDetailComponent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // --- State Fetching Data ---
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State untuk related products bisa tetap di sini atau dipindah ke komponennya sendiri
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // --- State UI Lokal ---
  const [quantity, setQuantity] = useState(1);

  // --- KONEKSI KE STORE & HOOK ---
  const { addToCart } = useCartStore();
  const {
    selectedVariant,
    mainImage,
    setMainImage,
    availableSizes,
    availableMaterials,
    uniqueColors,
    uniqueSizes,
    uniqueMaterials,
    handleColorSelect,
    handleSizeSelect,
    handleMaterialSelect,
  } = useProductVariants(product);

  // --- Efek untuk mengambil data dari API ---
  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Gunakan Promise.all untuk mengambil data produk dan related products secara paralel
        const [productRes, relatedRes] = await Promise.all([
          api.get(`/products/${slug}`),
          api.get(`/products/${slug}/related`),
        ]);
        setProduct(productRes.data);
        setRelatedProducts(relatedRes.data);
      } catch (err) {
        setError("Produk tidak ditemukan atau terjadi kesalahan.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // --- Handler Aksi ---
  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      if (selectedVariant && newQuantity > selectedVariant.stock) {
        return selectedVariant.stock;
      }
      return newQuantity;
    });
  };

  const handleAddToCart = () => {
  // Penjaga tetap sama
  if (!product || !selectedVariant) {
    showError("Silakan pilih varian produk yang lengkap.");
    return;
  }

  // 1. Buat objek variantData yang sesuai dengan ekspektasi store
  const variantDataToAdd = {
    variantId: selectedVariant.id,
    productId: product.id,
    productName: product.product_name,
    variantName: `${selectedVariant.color.name} / ${selectedVariant.size.name} / ${selectedVariant.material.name}`,
    image: selectedVariant.images[0]?.path || null,
    sku: selectedVariant.sku || '',
    price: selectedVariant.price,
    stock: selectedVariant.stock,
    weight: selectedVariant.weight,
  };

  // 2. Panggil addToCart dengan objek yang benar
  addToCart(variantDataToAdd, quantity);
};

const handleBuyNow = async () => {
  if (!product || !selectedVariant) {
    showError("Silakan pilih varian produk yang lengkap.");
    return;
  }

  // Buat objek yang sama untuk handleBuyNow
  const variantDataToAdd = {
    variantId: selectedVariant.id,
    productId: product.id,
    productName: product.product_name,
    variantName: `${selectedVariant.color.name} / ${selectedVariant.size.name}`,
    image: selectedVariant.images[0]?.path || null,
    sku: selectedVariant.sku || '',
    price: selectedVariant.price,
    stock: selectedVariant.stock,
    weight: selectedVariant.weight,
  };

  try {
    // Panggil await dengan argumen yang benar
    await addToCart(variantDataToAdd, quantity);
    router.push("/checkout");
  } catch (err) {
    console.error("Gagal melanjutkan ke checkout:", err);
  }
};

  // --- Kalkulasi & Format Tampilan ---
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(selectedVariant?.price || product?.min_price || 0);

  // --- Render Logic ---
  if (isLoading) return <ProductDetailSkeleton />;
  if (error || !product)
    return (
      <div className="flex items-center justify-center h-[50vh] text-destructive">
        {error}
      </div>
    );

  return (
    <div className="pt-24 bg-white">
      <div className="container mx-auto px-4 py-10">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/collections">Collections</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/collections?categories=${product.category.id}`}>
                  {product.category.category_name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.product_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <ImageGallery
            mainImage={mainImage}
            selectedVariant={selectedVariant}
            setMainImage={setMainImage}
            productName={product.product_name}
          />

          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {product.product_name}
              </h1>
              <div className="flex space-x-2">
                <Badge
                  variant="outline"
                  className="capitalize text-sm font-semibold"
                >
                  {product.category.category_name}
                </Badge>
                <Badge
                  variant="outline"
                  className="capitalize text-sm font-semibold"
                >
                  {product.gender}
                </Badge>
              </div>
              <p className="text-2xl font-semibold text-primary">
                {formattedPrice}
              </p>
              
            </div>
            <Separator />

            <VariantSelector
              selectedVariant={selectedVariant}
              uniqueColors={uniqueColors}
              uniqueSizes={uniqueSizes}
              uniqueMaterials={uniqueMaterials}
              availableSizes={availableSizes}
              availableMaterials={availableMaterials}
              handleColorSelect={handleColorSelect}
              handleSizeSelect={handleSizeSelect}
              handleMaterialSelect={handleMaterialSelect}
            />

            <Separator />

            <PurchaseActions
              selectedVariant={selectedVariant}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={["item-1"]}
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>Product Description</AccordionTrigger>
                <AccordionContent className="text-muted-foreground prose prose-sm max-w-none space-y-4">
                  <p>
                    {product.description || "Informasi produk tidak tersedia."}
                  </p>
                  {product.category.description && (
                    <div className="text-xs border-t pt-2 mt-4">
                      <p className="font-semibold text-gray-600">
                        About Category {product.category.category_name}:
                      </p>
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

        {relatedProducts.length > 0 && (
          <section className="bg-muted">
            <div className="container p-6 md:px-20 md:py-10">
              <h2 className="text-2xl font-bold text-center mb-8 text-primary">
                You might also like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((related) => {
                  const displayPrice =
                    related.min_price &&
                    related.max_price &&
                    related.min_price > 0
                      ? related.min_price === related.max_price
                        ? new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(related.min_price)
                        : `Start From: ${new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(related.min_price)}`
                      : "Prices Vary";
                  const imageUrl = related.variants[0]?.images[0]?.path;
                  return (
                    <div key={related.id}>
                      <Link
                        href={`/products/${related.slug}`}
                        className="group"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={
                              imageUrl
                                ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${imageUrl}`
                                : "/placeholder.png"
                            }
                            alt={related.product_name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <h3 className="mt-2 font-semibold text-md text-gray-800 line-clamp-2">
                          {related.product_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {displayPrice}
                        </p>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// --- 5. KOMPONEN WRAPPER (Tidak berubah) ---
// --- 3. KOMPONEN SKELETON ---
const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-10 pt-32 grid md:grid-cols-2 gap-12 animate-pulse">
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
      <div className="space-y-4 pt-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
);
export default function ProductDetailPageWrapper() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailComponent />
    </Suspense>
  );
}
