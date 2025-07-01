// components/BannerSlider.tsx
"use client";

import Slider from "react-slick";
import Image from "next/image";
import { useEffect, useState } from "react";
import bag1 from "@/public/products/BAG1.jpeg";
import bag2 from "@/public/products/BAG2.jpeg";
import bag3 from "@/public/products/BAG3.jpeg";

const slides = [
  {
    id: 1,
    image: bag1,
    title: "SHOP NOW",
    highlight: "50%",
    subtitle: "OFF",
  },
  {
    id: 2,
    image: bag2,
    title: "LIMITED DEAL",
    highlight: "30%",
    subtitle: "DISCOUNT",
  },
  {
    id: 3,
    image: bag3,
    title: "NEW ARRIVAL",
    highlight: "20%",
    subtitle: "OFF TODAY",
  },
];

const BannerSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="p-6 md:px-20 md:pt-20">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id} className="relative w-full h-[300px] md:h-[500px] lg:h-[600px]">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              style={{ objectFit: "cover" }}
              className="brightness-[.5] transition-all duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="text-white">
                <p className="text-2xl md:text-6xl font-bold text-secondary opacity-75">{slide.title}</p>
                <p className="text-5xl md:text-9xl font-extrabold text-secondary opacity-75">{slide.highlight}</p>
                <p className="text-xl md:text-3xl font-semibold text-secondary opacity-75">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BannerSlider;
