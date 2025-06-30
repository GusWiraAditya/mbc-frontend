"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { productsData } from "@/lib/data"; // Path to your product data
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/lib/cartStore"; // Ensure this path is correct
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCartStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const product = productsData.find((item) => item.id === Number(id));

  if (!product) {
    return <div className="text-center py-10">Product not found.</div>;
  }

  // Fungsi untuk navigasi gambar thumbnail
  const prevImage = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? product.thumbnail.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setSelectedIndex((prev) =>
      prev === product.thumbnail.length - 1 ? 0 : prev + 1
    );
  };

  // Fungsi untuk navigasi gambar di gallery modal
  const prevGalleryImage = () => {
    setGalleryIndex((prev) =>
      prev === 0 ? product.thumbnail.length - 1 : prev - 1
    );
  };

  const nextGalleryImage = () => {
    setGalleryIndex((prev) =>
      prev === product.thumbnail.length - 1 ? 0 : prev + 1
    );
  };

  // Fungsi untuk membuka gallery
  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  // Fungsi untuk menutup gallery
  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGalleryOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          prevGalleryImage();
          break;
        case "ArrowRight":
          nextGalleryImage();
          break;
        case "Escape":
          closeGallery();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen, product.thumbnail.length]);

  // Prevent body scroll when gallery is open
  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isGalleryOpen]);

  return (
    <div>
      <div className="p-4 md:p-10 space-y-10">
        {/* Product Detail Section */}
        <div className="bg-white md:pt-24 md:p-2 pt-20 p-4 flex flex-col md:flex-row gap-8">
          <div className="relative w-full md:w-1/2 aspect-[4/3]">
            <div className="mx-auto max-w-xs">
              <div className="flex flex-col items-center gap-6">
                {/* Gambar Utama dengan Panah */}
                <div className="relative w-full h-full aspect-[4/5]">
                  <Card className="w-full h-full rounded-xl overflow-hidden relative cursor-pointer">
                    <Image
                      src={product.thumbnail[selectedIndex]}
                      alt={`Image ${selectedIndex + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      priority
                      onClick={() => openGallery(selectedIndex)}
                    />
                  </Card>
                  {/* Tombol Panah */}
                  <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-200 z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-200 z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="flex gap-2 overflow-x-auto max-w-[300px] pb-2">
                  {product.thumbnail.map((img, index) => (
                    <Card
                      key={index}
                      onClick={() => {
                        setSelectedIndex(index);
                        openGallery(index);
                      }}
                      className={`relative w-14 h-14 rounded-md overflow-hidden cursor-pointer border-2 flex-shrink-0 transition-all duration-200 hover:scale-105 ${
                        selectedIndex === index
                          ? "border-blue-500 shadow-md"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumb ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="">
              <h1 className="text-4xl font-bold text-primary mb-2">
                {product.name}
              </h1>
              <p className="text-black text-lg font-medium mb-4">
                Rp. {product.price.toLocaleString("id-ID")}
              </p>
              <Accordion
                type="single"
                collapsible
                className="w-full mb-16"
                defaultValue="item-1"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger>Product Information</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>
                      Our flagship product combines cutting-edge technology with
                      sleek design. Built with premium materials, it offers
                      unparalleled performance and reliability.
                    </p>
                    <p>
                      Key features include advanced processing capabilities, and
                      an intuitive user interface designed for both beginners
                      and experts.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Shipping Details</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>
                      We offer worldwide shipping through trusted courier
                      partners. Standard delivery takes 3-5 business days, while
                      express shipping ensures delivery within 1-2 business
                      days.
                    </p>
                    <p>
                      All orders are carefully packaged and fully insured. Track
                      your shipment in real-time through our dedicated tracking
                      portal.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="flex gap-4 items-center justify-center md:items-start md:justify-start">
                <Button className="bg-secondary text-white px-4 py-2 rounded">
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
      </div>
      
      <div className="bg-secondary p-6 shadow w-full">
        <h2 className="text-center text-xl font-semibold mb-6">
          Related Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {productsData.slice(0, 4).map((item, idx) => (
            <motion.div
              custom={idx}
              initial="hidden"
              whileInView="visible"
              variants={itemVariants}
              key={item.id}
              className="w-full h-full overflow-hidden rounded group cursor-pointer"
            >
              <Link href={`/detailProducts/${item.id}`} className="block">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="transition-transform duration-500 group-hover:scale-105 object-cover"
                  />
                </div>
                <div className="flex flex-col items-start mt-2">
                  <p className="text-black text-sm sm:text-lg font-semibold truncate">
                    {item.name}
                  </p>
                  <p className="text-black text-sm sm:text-lg">
                    Rp. {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button className="bg-gray-300 text-sm px-4 py-2 rounded shadow">
            Show more
          </button>
        </div>
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            <button
              onClick={prevGalleryImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Main Gallery Image */}
            <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
              <Image
                src={product.thumbnail[galleryIndex]}
                alt={`Gallery image ${galleryIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Next Button */}
            <button
              onClick={nextGalleryImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
              {galleryIndex + 1} / {product.thumbnail.length}
            </div>

            {/* Thumbnail Navigation */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-md overflow-x-auto">
              {product.thumbnail.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setGalleryIndex(index)}
                  className={`relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border-2 ${
                    galleryIndex === index
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Gallery thumb ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}