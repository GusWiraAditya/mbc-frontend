"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Carousel({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-md" ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute top-1/2 -translate-y-1/2 left-2 z-10 bg-white/80 hover:bg-white p-1 rounded-full"
      >
        <ChevronLeft className="h-6 w-6 text-black" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute top-1/2 -translate-y-1/2 right-2 z-10 bg-white/80 hover:bg-white p-1 rounded-full"
      >
        <ChevronRight className="h-6 w-6 text-black" />
      </button>
    </div>
  )
}

export function CarouselItem({ children }: { children: React.ReactNode }) {
  return <div className="min-w-full">{children}</div>
}
