"use client";

// --- 1. IMPORTS ---
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Komponen & Ikon
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BannerSlider from "@/components/ui/banner-slider";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FaStar, FaRegStarHalfStroke, FaRegStar } from "react-icons/fa6";

// Data & utilitas
import api from "@/lib/api";
import { reviews, questions, galleryImages } from "@/lib/data"; // Data statis untuk review & FAQ boleh tetap ada
import { Product as ProductType, Category as CategoryType } from "@/app/(admin)/admin/data-produk/produk/components/produk-columns"; // Impor tipe dari admin

// --- 2. TIPE DATA LOKAL ---
type Settings = {
  hero_headline?: string;
  hero_subheadline?: string;
  hero_background_image?: string;
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<FaStar key={i} className="text-primary" />);
    } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
      stars.push(<FaRegStarHalfStroke key={i} className="text-primary" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-primary" />);
    }
  }
  return stars;
};
// --- 3. KOMPONEN SKELETON ---
const HeroSkeleton = () => (
    <div className="max-w-xl space-y-6">
        <div className="space-y-4">
            <Skeleton className="h-12 w-96" />
            <Skeleton className="h-12 w-80" />
        </div>
        <Skeleton className="h-6 w-full mt-2" />
        <Skeleton className="h-6 w-2/3" />
    </div>
);
const CardSkeleton = () => (
    <div className="w-full h-full space-y-2">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <Skeleton className="h-6 w-3/4 mt-4" />
        <Skeleton className="h-5 w-1/2" />
    </div>
);

// --- 4. KOMPONEN UTAMA ---
function HomeComponent() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryType[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(1);

  const toggleQuestion = (id: number) => setActiveIndex((prevId) => (prevId === id ? null : id));

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsRes, categoriesRes, settingsRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/categories/top'),
          api.get('/admin/settings')
        ]);
        setProducts(productsRes.data);
        setTopCategories(categoriesRes.data.data || categoriesRes.data); // Handle paginated/non-paginated response
        setSettings(settingsRes.data);
      } catch (err) {
        console.error("Gagal mengambil data awal:", err);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const heroBgUrl = settings?.hero_background_image
    ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${settings.hero_background_image}`
    : "/background/background.jpeg";

  return (
    <>
      {/* Section 1: Hero Dinamis */}
      <section className="relative h-screen bg-fixed bg-cover bg-center flex items-center px-6 md:px-20"
        style={{ backgroundImage: `linear-gradient(rgba(84, 51, 16,0.8), rgba(84, 51, 16,0.4)), url(${heroBgUrl})` }}>
        <motion.div
          animate={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -100 }} transition={{ duration: 0.7 }}
          className="max-w-xl text-white space-y-6"
        >
          {isLoading ? <HeroSkeleton /> : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight" dangerouslySetInnerHTML={{ __html: settings?.hero_headline || "Welcome," }}/>
              <p className="text-md md:text-lg text-gray-200">{settings?.hero_subheadline || "Temukan produk kulit terbaik buatan tangan."}</p>
            </>
          )}
          <Link href="/collections">
            <Button size="lg" className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">Shop Now</Button>
          </Link>
        </motion.div>
      </section>

      <BannerSlider />

      {/* Section 2: Top Categories Dinamis */}
      <section className="p-6 md:px-20 md:pt-20">
        <motion.h2 whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 50 }} transition={{ duration: 0.5 }} className="mb-8 text-2xl sm:text-3xl font-bold text-primary">
            Top Categories
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="w-full h-64 md:h-80 rounded" />)
          ) : (
            topCategories.map((category, idx) => (
              <motion.div custom={idx} initial="hidden" whileInView="visible" variants={itemVariants} key={category.id} className="relative w-full h-64 md:h-80 overflow-hidden rounded group cursor-pointer">
                <Link href={`/collections?categories=${category.id}`}>
                  <Image src={category.image ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${category.image}` : "/placeholder.png"} alt={category.category_name} fill style={{ objectFit: "cover" }} className="transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
                  <div className="absolute bottom-0 left-0 p-6 z-20"><p className="text-white text-xl sm:text-2xl font-semibold">{category.category_name}</p></div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>
      
      {/* Section 3: Top Collections Dinamis */}
      <section className="p-6 md:px-20 md:py-10">
        <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 50 }} transition={{ duration: 0.5 }} className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">Top Collections</h2>
            <Link href="/collections" className="text-sm font-normal cursor-pointer hover:underline">See More</Link>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => <CardSkeleton key={idx} />)
          ) : (
            products.map((product, idx) => {
              const { min_price, max_price } = product;
              const format = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
              const displayPrice = (min_price && max_price && min_price !== max_price) ? `${format(min_price)} - ${format(max_price)}` : format(min_price || 0);
              const imageUrl = product.variants[0]?.images[0]?.path;
              const publicImageUrl = imageUrl ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${imageUrl}` : "/placeholder.png";

              return (
                <motion.div custom={idx} initial="hidden" whileInView="visible" variants={itemVariants} key={product.id} className="w-full h-full rounded group">
                  <Link href={`/products/${product.slug}`} className="flex flex-col h-full cursor-pointer">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg"><Image src={publicImageUrl} alt={product.product_name} fill style={{ objectFit: "cover" }} className="transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw"/></div>
                    <div className="flex flex-col flex-grow mt-4"><h4 className="text-black text-base font-semibold line-clamp-2" style={{ minHeight: "2.5rem" }}>{product.product_name}</h4></div>
                    <p className="text-gray-800 text-lg font-medium mt-2">{displayPrice}</p>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

       {/* ... (Section 4, 5, 6: Gallery, Reviews, FAQ tidak berubah) ... */}
      {/* Section 4: Product Gallery - Ganti Video */}
      <section className="p-6 md:px-20 md:py-10">
        {/* <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-between mb-4 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            Gallery
          </h2>
          <Link
            href="/collections"
            className="text-sm font-normal cursor-pointer hover:underline"
          >
            See More
          </Link>
        </motion.div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 items-start">
          {/* Kolom Kiri */}
          <div className="flex md:flex-col gap-4 h-full">
            {[galleryImages[1].img].map((img, index) => (
              <motion.div
                custom={index}
                initial="hidden"
                whileInView="visible"
                variants={itemVariants}
                key={`left-${index}`}
                className="relative w-full h-[215px] overflow-hidden flex-shrink-0 cursor-pointer group"
              >
                <Link href="#">
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Kolom Grid 1 */}
          <div className="grid grid-cols-2 gap-1 h-full">
            {[galleryImages[4].img, galleryImages[2].img].map((img, index) => (
              <motion.div
                custom={index}
                initial="hidden"
                whileInView="visible"
                variants={itemVariants}
                key={`grid1-${index}`}
                className="relative w-full h-[215px] overflow-hidden flex-shrink-0 cursor-pointer group"
              >
                <Link href="#">
                  <Image
                    src={img}
                    alt={`Grid1-${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Kolom Grid 2 */}
          <div className="grid grid-cols-2 gap-1 h-full">
            {[galleryImages[3].img, galleryImages[0].img].map((img, index) => (
              <motion.div
                custom={index}
                initial="hidden"
                whileInView="visible"
                variants={itemVariants}
                key={`grid2-${index}`}
                className="relative w-full h-[215px] overflow-hidden flex-shrink-0 cursor-pointer group"
              >
                <Link href="#">
                  <Image
                    src={img}
                    alt={`Grid2-${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Kolom Kanan */}
          <div className="flex md:flex-col gap-4 h-full">
            {[galleryImages[3].img].map((img, index) => (
              <motion.div
                custom={index}
                initial="hidden"
                whileInView="visible"
                variants={itemVariants}
                key={`right-${index}`}
                className="relative w-full h-[215px] overflow-hidden flex-shrink-0 cursor-pointer group"
              >
                <Link href="#">
                  <Image
                    src={img}
                    alt={`Thumbnail Right ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Customer Reviews */}
      <section className="p-6 md:px-20 md:py-10">
        <motion.h2
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.7 }}
          className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-8"
        >
          Customer Reviews
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* REVISI: Menggunakan `review.id` untuk `key` */}
          {reviews.map((review, idx) => (
            <motion.div
              custom={idx}
              initial="hidden"
              whileInView="visible"
              variants={itemVariants}
              key={review.id}
              className="w-full h-full overflow-hidden rounded-lg bg-neutral-50 shadow-md p-5 flex flex-col"
            >
              <div className="flex items-center border-b-2 border-primary/20 pb-3">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                  <Image
                    src={review.img}
                    alt={review.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="80px"
                  />
                </div>
                <div className="flex flex-col items-start text-primary">
                  <p className="text-lg font-semibold">{review.name}</p>
                  <p className="text-sm font-normal text-secondary">
                    {review.email}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-justify mt-4 text-primary leading-relaxed">
                "{review.comment}"
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 6: FAQ */}
      <section className="bg-neutral-50 p-6 md:px-20 md:py-10">
        <div className="w-full max-w-4xl mx-auto px-4">
          <motion.h2
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.7 }}
            className="text-2xl text-center sm:text-3xl font-bold text-primary mb-8"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {/* REVISI: Menggunakan `item.id` untuk `key` dan `onClick` */}
            {questions.map((item, index) => (
              <motion.div
                custom={index}
                initial="hidden"
                whileInView="visible"
                variants={itemVariants}
                key={item.id}
                className="bg-primary text-white rounded-xl px-6 py-4 shadow-md"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleQuestion(item.id)}
                >
                  <h3 className="text-lg md:text-xl font-bold">
                    {item.question}
                  </h3>
                  {activeIndex === item.id ? (
                    <ChevronUp className="w-6 h-6 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 flex-shrink-0" />
                  )}
                </div>
                {activeIndex === item.id && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 text-base text-white border-t-2 border-secondary/30 pt-3"
                  >
                    {item.answer}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// Komponen Wrapper untuk Suspense
export default function HomePageWrapper() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen w-full">Memuat Halaman...</div>}>
            <HomeComponent />
        </Suspense>
    )
}