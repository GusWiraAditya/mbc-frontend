"use client"; // Menandakan ini adalah Client Component karena menggunakan state dan event handler

// import "./globals.css"
import { useEffect, useState } from "react";
import Image from "next/image"; // Gunakan komponen Image dari Next.js untuk optimasi
import { motion, Variants } from "framer-motion";

// REVISI: Menggunakan path alias yang benar untuk komponen UI.
import { Button } from "@/components/ui/button"; 

// Impor ikon
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import { FaStar, FaRegStarHalfStroke, FaRegStar } from "react-icons/fa6";

// REVISI: Menggunakan path alias yang benar untuk data.
import { categories, productsData, reviews, questions } from "@/lib/data";

// REVISI: Menggunakan path alias yang benar untuk gambar dari folder public.
import bgImage from "@/public/background/background.jpeg"; 
import Link from "next/link";

// Animation variant untuk setiap item (tetap sama)
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

// Render rating bintang secara dinamis
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


export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = "W6bVhPQqrnw"; // ambil dari URL video
  // REVISI: State untuk FAQ sekarang menyimpan ID, bukan index.
  const [activeIndex, setActiveIndex] = useState<number | null>(1); // Buka item pertama secara default

  const toggleQuestion = (id: number) => {
    setActiveIndex((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
        document.body.style.overflowX = 'auto';
    }
  }, []);

  return (
    <>
      {/* Section 1: Hero */}
      <section
        className="relative h-screen bg-fixed bg-cover bg-center flex items-center px-6 md:px-20"
        style={{
          backgroundImage: `linear-gradient(rgba(109,78,46,0.8), rgba(109,78,46,0.8)), url(${bgImage.src})`,
        }}
      >
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl text-white space-y-6"
        >
          {/* FIX: <h1>, <p>, dan <Button> sekarang menjadi saudara (siblings),
            bukan bersarang (nested). Ini memperbaiki error hydration.
          */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Handcrafted Genuine <br /> Leather Camera.
          </h1>
          <p className="text-md md:text-lg text-gray-200">
            This elegant camera bag is crafted from high-quality genuine
            leather, offering durability, style, and practical organization.
          </p>
          <Button size="lg" className="bg-secondary text-white font-bold hover:opacity-90">
            Shop Now
          </Button>
        </motion.div>
      </section>

      {/* Section 2: Top Categories */}
      <section className="p-6 md:px-20 md:pt-20">
        <motion.h2
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.7 }}
          className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-8"
        >
          Our Top Categories
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* REVISI: Menggunakan `category.id` untuk `key` */}
          {categories.map((category, idx) => (
            <motion.div
              custom={idx}
              initial="hidden"
              whileInView="visible"
              variants={itemVariants}
              key={category.id}
              className="relative w-full h-64 md:h-80 overflow-hidden rounded group cursor-pointer"
            >
              <Image
                src={category.img}
                alt={category.label}
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[rgba(109,78,46,0.5)] z-10"></div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <p className="text-white text-xl sm:text-3xl font-semibold text-center px-2">
                  {category.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 3: Top Collections */}
      <section className="p-6 md:px-20 md:py-10">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-between mb-4 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            Our Top Collections
          </h2>
          <Link href="/collections" className="text-sm font-normal cursor-pointer hover:underline">See More</Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* REVISI: Menggunakan `item.id` untuk `key` */}
          {productsData.map((item, idx) => (
            
            <motion.div
              custom={idx}
              initial="hidden"
              whileInView="visible"
              variants={itemVariants}
              key={item.id}
              className="w-full h-full overflow-hidden rounded group cursor-pointer"
            >
              <Link href={`/detailProducts/${item.id}`} className="flex-shrink-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                
                <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className="flex flex-col items-start mt-2">
                <p className="text-black text-sm sm:text-lg font-semibold">
                  {item.name}
                </p>
                <p className="text-black text-sm sm:text-lg font-normal">
                  Rp.{" "}
                  {item.price.toLocaleString("id-ID")}
                </p>
              </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4: Video Player */}
      <div className="relative w-full max-w-5xl h-[300px] md:h-[600px] mx-auto my-10 aspect-video overflow-hidden shadow-lg rounded-lg">
        {!isPlaying ? (
          <div
            className="relative w-full h-full cursor-pointer"
            onClick={() => setIsPlaying(true)}
          >
            <Image
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt="Video Thumbnail"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            <div className="absolute inset-0 bg-primary/60"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
                <Play className="text-primary w-8 h-8" />
              </div>
            </div>
          </div>
        ) : (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      
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
                            style={{objectFit: "cover"}}
                            sizes="80px"
                        />
                    </div>
                    <div className="flex flex-col items-start text-primary">
                        <p className="text-lg font-semibold">{review.name}</p>
                        <p className="text-sm font-normal text-secondary">{review.email}</p>
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
                    <h3 className="text-lg md:text-xl font-bold">{item.question}</h3>
                    {activeIndex === item.id ? (
                    <ChevronUp className="w-6 h-6 flex-shrink-0" />
                    ) : (
                    <ChevronDown className="w-6 h-6 flex-shrink-0" />
                    )}
                </div>
                {activeIndex === item.id && (
                    <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
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
