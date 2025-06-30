"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";
import bgImage from "@/public/background/bg-collections.jpeg";
import { productsData, categories as initialCategories } from "@/lib/data"; // Pastikan impor dari file data yang benar
// import type { Product, Category } from "@/lib/data";

const priceRanges = [
  { id: "p1", label: "Under Rp 500.000", min: 0, max: 499999 },
  { id: "p2", label: "Rp 500.000 - Rp 1.000.000", min: 500000, max: 1000000 },
  { id: "p3", label: "Above Rp 1.000.000", min: 1000001, max: Infinity },
];

const genderOptions = ["Men", "Women", "Unisex"];
const availabilityOptions = ["In Stock", "Out of Stock"];

export default function CollectionsPage() {
  const [showFilter, setShowFilter] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);

  const [filters, setFilters] = useState({
    searchTerm: "",
    categories: [] as string[],
    priceRange: "",
    genders: [] as string[],
    minRating: 0,
    availability: "",
  });

  const handleFilterChange = (
    filterType: keyof typeof filters,
    value: string | number | string[]
  ) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleCheckboxChange = (
    filterType: "categories" | "genders",
    value: string
  ) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    handleFilterChange(filterType, newValues);
  };

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      // Search Term Filter
      if (
        filters.searchTerm &&
        !product.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }
      // Category Filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }
      // Price Range Filter
      const selectedPriceRange = priceRanges.find(
        (r) => r.id === filters.priceRange
      );
      if (
        selectedPriceRange &&
        (product.price < selectedPriceRange.min ||
          product.price > selectedPriceRange.max)
      ) {
        return false;
      }
      // Gender Filter
      if (
        filters.genders.length > 0 &&
        !filters.genders.includes(product.gender)
      ) {
        return false;
      }
      // Rating Filter
      if (filters.minRating > 0 && product.rating < filters.minRating) {
        return false;
      }
      // Availability Filter
      if (
        filters.availability &&
        product.availability !== filters.availability
      ) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const [sortedProducts, setSortedProducts] = useState(filteredProducts);

  const handleSort = (
    type: "lowest" | "highest" | "newest" | "oldest" | "default"
  ) => {
    setSortOpen(false);
    let tempProducts = [...filteredProducts];

    switch (type) {
      case "lowest":
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case "highest":
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        tempProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        tempProducts.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      default:
        // 'default' case resets to the original filtered order
        tempProducts = [...filteredProducts];
        break;
    }
    setSortedProducts(tempProducts);
  };

  useEffect(() => {
    setSortedProducts(filteredProducts);
  }, [filteredProducts]);

  return (
    <>
      {/* HERO */}
      <section
        className="relative h-[550px] bg-fixed bg-cover bg-center flex items-center justify-center px-6 md:px-20"
        style={{
          backgroundImage: `linear-gradient(rgba(109,78,46,0.8), rgba(109,78,46,0.8)), url(${bgImage.src})`,
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

      {/* COLLECTION SECTION */}
      <section className="p-6 md:px-20 md:py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="relative w-full md:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search products..."
              className="border rounded-md pl-10 pr-4 py-2 w-full md:w-80"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>
          <div className="flex gap-4 items-center self-end">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50"
            >
              <SlidersHorizontal size={16} />
              {showFilter ? "Hide Filters" : "Show Filters"}
            </button>
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Sort By
                {sortOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {sortOpen && (
                <ul className="absolute right-0 z-10 bg-white border mt-1 w-48 rounded-md shadow-lg">
                  {/* REVISI: Menambahkan opsi "Relevance" */}
                  <li
                    onClick={() => handleSort("default")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Relevance
                  </li>
                  <li
                    onClick={() => handleSort("newest")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Newest
                  </li>
                  <li
                    onClick={() => handleSort("oldest")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Oldest
                  </li>
                  <li
                    onClick={() => handleSort("lowest")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Price: Low to High
                  </li>
                  <li
                    onClick={() => handleSort("highest")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Price: High to Low
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          {/* FILTER SIDEBAR */}
          <motion.aside
            initial={false}
            animate={{
              width: showFilter ? 320 : 0,
              opacity: showFilter ? 1 : 0,
              padding: showFilter ? 16 : 0,
              marginRight: showFilter ? 32 : 0,
              border: showFilter ? "1px solid #e5e7eb" : "0px",
            }}
            transition={{ duration: 0.3 }}
            className="hidden md:block sticky top-[120px] max-h-[calc(100vh-140px)] overflow-y-auto shrink-0 space-y-6 text-gray-950 rounded-lg bg-white"
          >
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Categories</h3>
              {initialCategories.map((cat) => (
                <label className="block" key={cat.id}>
                  <input
                    type="checkbox"
                    className="mr-2 rounded"
                    checked={filters.categories.includes(cat.label)}
                    onChange={() =>
                      handleCheckboxChange("categories", cat.label)
                    }
                  />{" "}
                  {cat.label}
                </label>
              ))}
            </div>
            {/* Price */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Price</h3>
              {priceRanges.map((range) => (
                <label className="block" key={range.id}>
                  <input
                    type="radio"
                    name="price"
                    className="mr-2"
                    checked={filters.priceRange === range.id}
                    onChange={() => handleFilterChange("priceRange", range.id)}
                  />{" "}
                  {range.label}
                </label>
              ))}
            </div>
            {/* Gender */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Gender</h3>
              {genderOptions.map((gender) => (
                <label className="block" key={gender}>
                  <input
                    type="checkbox"
                    className="mr-2 rounded"
                    checked={filters.genders.includes(gender)}
                    onChange={() => handleCheckboxChange("genders", gender)}
                  />{" "}
                  {gender}
                </label>
              ))}
            </div>
            {/* Rating */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Rating</h3>
              {[4, 3, 2, 1].map((star) => (
                <label className="block" key={star}>
                  <input
                    type="radio"
                    name="rating"
                    className="mr-2"
                    checked={filters.minRating === star}
                    onChange={() => handleFilterChange("minRating", star)}
                  />{" "}
                  {star} Stars & Up
                </label>
              ))}
            </div>
            {/* Availability */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Availability</h3>
              {availabilityOptions.map((option) => (
                <label className="block" key={option}>
                  <input
                    type="radio"
                    name="availability"
                    className="mr-2"
                    checked={filters.availability === option}
                    onChange={() => handleFilterChange("availability", option)}
                  />{" "}
                  {option}
                </label>
              ))}
            </div>
            <button
              onClick={() =>
                setFilters({
                  searchTerm: "",
                  categories: [],
                  priceRange: "",
                  genders: [],
                  minRating: 0,
                  availability: "",
                })
              }
              className="w-full text-sm text-gray-700 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Clear All Filters
            </button>
          </motion.aside>

          {/* PRODUCT LIST */}
          <div className="flex-1">
            {sortedProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sortedProducts.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full overflow-hidden group"
                  >
                    <Link href={`/detailProducts/${item.id}`} className="block">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg cursor-pointer">
                        {item.availability === "Out of Stock" && (
                          <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded z-10">
                            OUT OF STOCK
                          </div>
                        )}
                        <Image
                          src={item.img}
                          alt={item.name}
                          fill
                          style={{ objectFit: "cover" }}
                          className="transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                      <div className="mt-2">
                        <h4 className="text-black text-base font-semibold truncate hover:text-primary transition-colors duration-200">
                          {item.name}
                        </h4>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-700 text-base">
                            {item.price.toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            })}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star
                              size={16}
                              className="text-yellow-500 fill-yellow-500"
                            />
                            <span className="text-sm text-gray-600">
                              {item.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-xl font-semibold">No Products Found</h3>
                <p className="text-gray-600 mt-2">
                  Try adjusting your filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
