"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

const FloatingWhatsappButton = () => {
  const phoneNumber = "6285174441396"; // Ganti dengan nomor WhatsApp kamu

  return (
    <Link
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-primary hover:bg-primary/80 text-white rounded-full p-4 shadow-lg transition-all duration-300">
        <FaWhatsapp size={24} />
      </div>
    </Link>
  );
};

export default FloatingWhatsappButton;
