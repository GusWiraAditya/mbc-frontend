"use client";

import { FC } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  IconHeart,
  IconUser,
  IconMapPin,
  IconLogout,
} from "@tabler/icons-react";
import { RiShoppingBag4Line } from "react-icons/ri";

const Sidebar: FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    { label: "My Order", href: "/profile/myOrder", icon: <RiShoppingBag4Line size={18} /> },
    // { label: "Wishlist", href: "/wishlist", icon: <IconHeart size={18} /> },
    { label: "Account Info", href: "/profile/accountDetail", icon: <IconUser size={18} /> },
    { label: "Address", href: "/address", icon: <IconMapPin size={18} /> },
    { label: "Logout", href: "/", icon: <IconLogout size={18} /> },
  ];
  
  

  return (
    <aside className="w-64 min-h-screen p-6 space-y-4 bg-white">
      {menu.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <div
            key={item.label}
            onClick={() => router.push(item.href)}
            className={`flex items-center space-x-2 cursor-pointer text-sm ${
              isActive ? "font-semibold text-black" : "text-gray-500"
            }`}
          >
            <span className="text-primary">{item.icon}</span>
            <span className="text-primary">{item.label}</span>
          </div>
        );
      })}
    </aside>
  );
};

export default Sidebar;
