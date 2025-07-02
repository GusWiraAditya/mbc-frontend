import { StaticImageData } from "next/image";

// REVISED: Using the '@' alias for cleaner imports.
// This assumes the '@/*' alias is set up in tsconfig.json to point to the project root.
import cat1 from "@/public/categories/cat1.jpeg";
import cat2 from "@/public/categories/cat2.jpeg";
import cat3 from "@/public/categories/cat3.jpeg";
import bag1 from "@/public/products/BAG1.jpeg";
import bag2 from "@/public/products/BAG2.jpeg";
import bag3 from "@/public/products/BAG3.jpeg";
import bag4 from "@/public/products/BAG4.jpeg";


// --- Data Types (Interfaces) ---

export interface Category {
  id: number;
  img: StaticImageData;
  label: string;
}
export interface GalleryImage {
  id: number;
  img: StaticImageData;
  thumbnail: StaticImageData[]; // Optional thumbnail for gallery
  label: string;
}


// REVISED: Added `createdAt` property for sorting by date
export interface Product {
  id: number;
  img: StaticImageData;
  thumbnail: StaticImageData[]; // Optional thumbnail for product listing
  name: string;
  price: number;
  category: "Shoulder Bag" | "Messenger Bag" | "Waist Bag";
  gender: "Men" | "Women" | "Unisex";
  rating: number; 
  availability: "In Stock" | "Out of Stock";
  createdAt: string; // ISO 8601 date string (e.g., "2025-06-18T10:00:00Z")
}

export interface Review {
  id: number;
  img: StaticImageData;
  name: string;
  email: string;
  rating: number;
  comment: string;
}

export interface Question {
  id: number;
  question: string;
  answer: string;
}


// --- Actual Data ---

export const categories: Category[] = [
  { id: 1, img: cat1, label: "Shoulder Bag" },
  { id: 2, img: cat2, label: "Messenger Bag" },
  { id: 3, img: cat3, label: "Waist Bag" },
];
export const galleryImages: GalleryImage[] = [
  { id: 1, img: bag1, label: "Spartan Backpack", thumbnail: [bag1, bag2, bag3] },
  { id: 2, img: bag2, label: "Pepz Backpack", thumbnail: [bag2, bag1, bag3] },
  { id: 3, img: bag3, label: "Zarwo Slingbag", thumbnail: [bag3, bag2, bag1] },
  { id: 4, img: bag4, label: "Petod Leather Bag", thumbnail: [bag4, bag3, bag2] },
  { id: 5, img: bag1, label: "Classic Waist Pouch", thumbnail: [bag1, bag3, bag2] },
  { id: 6, img: bag2, label: "Urban Explorer", thumbnail: [bag2, bag1, bag4] },
  { id: 7, img: bag3, label: "Elegant Crossbody", thumbnail: [bag3, bag2, bag4] },
  { id: 8, img: bag4, label: "Rugged Utility Bag", thumbnail: [bag4, bag3, bag2] },
];

export const productsData: Product[] = [
  { id: 1, img: bag1, thumbnail: [bag1, bag2, bag3], name: "Spartan Backpack", price: 777000, category: "Messenger Bag", gender: "Unisex", rating: 4.5, availability: "In Stock", createdAt: "2025-06-18T10:00:00Z" },
  { id: 2, img: bag2, thumbnail: [bag2, bag1, bag3], name: "Pepz Backpack", price: 999000, category: "Messenger Bag", gender: "Unisex", rating: 5, availability: "In Stock", createdAt: "2025-05-20T11:00:00Z" },
  { id: 3, img: bag3, thumbnail: [bag3, bag2, bag1], name: "Zarwo Slingbag", price: 550000, category: "Shoulder Bag", gender: "Women", rating: 4, availability: "Out of Stock", createdAt: "2025-06-15T12:00:00Z" },
  { id: 4, img: bag4, thumbnail: [bag4, bag3, bag2], name: "Petod Leather Bag", price: 696900, category: "Shoulder Bag", gender: "Men", rating: 4.8, availability: "In Stock", createdAt: "2025-04-01T09:00:00Z" },
  { id: 5, img: bag1, thumbnail: [bag1, bag3, bag2], name: "Classic Waist Pouch", price: 350000, category: "Waist Bag", gender: "Unisex", rating: 3.9, availability: "In Stock", createdAt: "2025-06-10T14:00:00Z" },
  { id: 6, img: bag2, thumbnail: [bag2, bag1, bag4], name: "Urban Explorer", price: 1200000, category: "Messenger Bag", gender: "Men", rating: 4.9, availability: "In Stock", createdAt: "2025-06-01T16:00:00Z" },
  { id: 7, img: bag3, thumbnail: [bag3, bag2, bag4], name: "Elegant Crossbody", price: 850000, category: "Shoulder Bag", gender: "Women", rating: 4.7, availability: "Out of Stock", createdAt: "2025-03-25T18:00:00Z" },
  { id: 8, img: bag4, thumbnail: [bag4, bag3, bag2], name: "Rugged Utility Bag", price: 950000, category: "Waist Bag", gender: "Men", rating: 4.2, availability: "In Stock", createdAt: "2025-05-30T13:00:00Z" },
];

export const reviews: Review[] = [
  { 
    id: 1,
    img: bag1, 
    name: "Gus Wira", 
    email: "guswiraaditya@gmail.com",
    rating: 4.5,
    comment: "The leather quality is premium and the stitching is very neat. Very satisfied with this purchase!"
  },
  { 
    id: 2,
    img: bag2, 
    name: "Hendra Dinata", 
    email: "hendradinata17@gmail.com",
    rating: 5,
    comment: "The design is cool and functional. It fits a lot of items but still looks stylish. Recommended!"
  },
  { 
    id: 3,
    img: bag3, 
    name: "Tjok Turah Alit", 
    email: "cokoerdaykey99@gmail.com",
    rating: 4,
    comment: "Fast shipping and secure packaging. The product matches the picture and description. Great!"
  },
];

export const questions: Question[] = [
  {
    id: 1,
    question: "What is MadeByCan?",
    answer:
      "MadeByCan is an e-commerce platform that empowers MSMEs (Micro, Small, and Medium Enterprises) to market their handmade products online to local and international markets.",
  },
  {
    id: 2,
    question: "How do I register as a seller?",
    answer:
      "You can register as a seller by filling out the registration form on the 'MSME Registration' page, then our team will verify your data within a maximum of 2x24 hours.",
  },
  {
    id: 3,
    question: "Are the products sold guaranteed to be authentic?",
    answer:
      "Yes, we work directly with local artisans and curate the products before they are displayed on the platform.",
  },
  {
    id: 4,
    question: "What are the payment methods?",
    answer:
      "We provide various payment methods such as bank transfer, e-wallets (OVO, DANA, GoPay), and credit cards.",
  },
];
