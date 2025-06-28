'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { productsData } from '@/lib/data'; // Path to your product data
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/cartStore'; // Ensure this path is correct
import { Button } from '@/components/ui/button';

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
  const { addToCart } = useCartStore(); // ✅ Pindahkan hook ke dalam komponen
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const product = productsData.find((item) => item.id === Number(id));

  if (!product) {
    return <div className="text-center py-10">Product not found.</div>;
  }
  return (
    <div className="p-4 md:p-10 space-y-10">
      {/* Product Detail Section */}
      <div className="bg-white p-32 flex flex-col md:flex-row gap-8">
        <div className="relative w-full md:w-1/2 aspect-[4/3]">
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="rounded-xl object-cover"
          />
        </div>
        <div className="flex-1 space-y-4 flex flex-col justify-between">
          <div className="">
            <h1 className="text-4xl font-bold text-primary mb-2">
            {product.name}
            </h1>
            <p className="text-black text-lg font-medium mb-2">Rp. {product.price.toLocaleString('id-ID')}</p>
            <h3 className="text-sm font-light">Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus laborum, fugit in illum eos ipsam reprehenderit magnam omnis, quidem, optio vel expedita soluta at! Velit omnis voluptates quia exercitationem eaque.</h3>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-72 text-secondary font-semibold">
              {isProfileOpen ? 'Hide' : 'Show'} Details
              {/* <ChevronDown size={16} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} /> */}
            </button>
            {isProfileOpen && (
              <p className="text-sm text-gray-600 leading-relaxed">
                This elegant camera bag is crafted from high-quality genuine leather, offering durability, style, and practical organization.
              </p>
            )}
              
          </div>

          <div className="flex gap-4 pt-4">
            <Button className="bg-secondary text-white px-4 py-2 rounded">
              Checkout
            </Button>
            {/* <Button onClick={() => addToCart(Product)} className="border border-gray-400 px-4 py-2 rounded text-gray-100 hover:bg-secondary hover:text-white transition-colors">
              Add to Cart
            </Button> */}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-[#B0A37F]/30 p-6 rounded-xl shadow">
        <h2 className="text-center text-xl font-semibold mb-6">Related Products</h2>
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <div className="flex flex-col items-start mt-2">
                  <p className="text-black text-sm sm:text-lg font-semibold truncate">
                    {item.name}
                  </p>
                  <p className="text-black text-sm sm:text-lg">
                    Rp. {item.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button className="bg-gray-300 text-sm px-4 py-2 rounded shadow">Show more</button>
        </div>
      </div>
    </div>
  );
}
