import { FaInstagram, FaFacebookF, FaTiktok, FaYoutube } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      href: "https://instagram.com",
      label: "Instagram",
      icon: <FaInstagram />,
    },
    {
      href: "https://facebook.com",
      label: "Facebook",
      icon: <FaFacebookF />,
    },
    { href: "https://tiktok.com", label: "TikTok", icon: <FaTiktok /> },
    { href: "https://youtube.com", label: "YouTube", icon: <FaYoutube /> },
  ];

  return (
    <footer className="bg-white text-primary text-sm shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 py-10 text-center">
        {/* Social Media */}
        <div className="mb-6">
          <p className="font-bold mb-3 tracking-wider">FOLLOW US ON</p>
          <div className="flex justify-center gap-6 text-2xl">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                target="_blank" // Buka di tab baru
                rel="noopener noreferrer" // Praktik keamanan untuk link eksternal
                className="hover:text-secondary transition-colors"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright & Policies */}
        <div className="text-xs sm:text-sm mt-8 text-gray-600">
          <p className="mb-2 font-semibold">
            ©{currentYear} MBC | All Rights Reserved.
          </p>
          <div className="font-semibold space-x-2">
            {/* Menggunakan Link untuk navigasi internal */}
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/return-policy" className="hover:underline">
              Return & Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
