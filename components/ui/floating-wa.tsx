"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import api from "@/lib/api";
import { useEffect, useState, Suspense } from "react";

type Settings = {
    contact_phone: string;
};

const FloatingWhatsappButton = () => {

  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Ambil data pengaturan dari API yang sudah ada
    api.get('/admin/settings')
      .then(res => {
        setSettings(res.data);
      })
      .catch(err => {
        console.error("Gagal memuat pengaturan:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  return (
    <a
      href={`https://wa.me/${settings?.contact_phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-primary hover:bg-primary/80 text-white rounded-full p-4 shadow-lg transition-all duration-300">
        <FaWhatsapp size={24} />
      </div>
    </a>
  );
};

export default FloatingWhatsappButton;
