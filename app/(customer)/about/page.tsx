"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function AboutPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = "W6bVhPQqrnw";

  useEffect(() => {
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <>
      <section
        className="relative h-[550px] bg-fixed bg-cover bg-center flex items-center justify-center px-6 md:px-20"
        style={{
          backgroundImage: `linear-gradient(rgba(109,78,46,0.8), rgba(109,78,46,0.8)), url(/gallery/BAG2.jpeg)`,
        }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl text-white text-center mt-20"
        >
          <h1 className="text-3xl md:text-5xl font-bold">
            <span className="block text-6xl">MBC</span>
            <span className="block mt-4 text-4xl">MADE BY CAN</span>
          </h1>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="grid place-items-center px-6 md:px-20 pt-12 pb-12 text-white">
        <div className="bg-secondary grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 max-w-6xl w-full">
          
          {/* Left Top: Description */}
          <div className="p-6 text-center flex flex-col items-center justify-center">
            <p className="text-md leading-relaxed">
              Designed for photographers who value both function and aesthetics,
              this leather camera bag features a vintage look with modern protection.
              With adjustable dividers and secure closures, it keeps your gear safe
              while adding a timeless touch to your style.
            </p>
          </div>

          {/* Right Top: Video */}
          <div className="w-full aspect-video relative overflow-hidden">
            {!isPlaying ? (
              <div
                className="relative w-full h-full cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-md hover:scale-110 transition-transform duration-300">
                    <Play className="text-[#6d4e2e] w-8 h-8" />
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* Left Bottom: Image */}
          <div>
            <img
              src="/products/BAG1.jpeg"
              alt="bag"
              className="aspect-video h-full object-cover shadow-lg"
            />
          </div>

          {/* Right Bottom: Bold Text */}
          <div className="p-6 text-center flex flex-col items-center justify-center">
            <p className="text-md font-semibold leading-relaxed">
              Welcome to MadebyCan, your go-to destination for high-quality,
              handcrafted products. We believe in timeless design, lasting durability,
              and honest craftsmanship. Every piece is thoughtfully made to elevate
              your everyday experience.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
