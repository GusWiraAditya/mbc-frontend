"use client";

import { useRouter } from "next/navigation";
import { IconPencil } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import SidebarWrapper from "@/components/sidebarwrapper"; // Sama seperti OrdersPage
import { useAuthStore } from "@/lib/store";
import { IconRefresh } from "@tabler/icons-react";


export default function MyAccountPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user) ?? { name: "", email: "" };

  const users = {
    name: "Aditya Saputra",
    email: "aditya1609saputra@gmail.com",
    birthday: "1 / 1 / 1970",
    phone: "+62 85156711395",
    gender: "-",
    profession: "-",
    instagram: "adityaasptraa",
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col items-center py-8 border-b pt-32">
        <button
          onClick={() => window.location.reload()}
          className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
          title="Refresh page"
        >
          <IconRefresh size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg text-primary font-semibold mt-4">{user.name} Account</h1>
        <p className="text-sm text-gray-500">
          You can manage your account and track your order here
        </p>
      </div>
      
      <div className="flex bg-gray-50 pt-2 px-36 py-20">
        <SidebarWrapper />
        <main className="flex-1 p-6 max-w-full mx-auto space-y-6">
          <h1 className="text-2xl font-semibold text-primary mb-4">
            Account Info
          </h1>

          {/* Info Section */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold text-black">My details</h2>
              <button
                className="text-md font-medium underline"
                onClick={() => router.push("/profile/myAccount/edit")}
              >
                Edit
              </button>
            </div>

            <div className="space-y-4 text-md text-gray-700">
              <div>
                <p className="text-gray-400">Name</p>
                <p className="text-black">{user.name}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-black">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Birthday</p>
                <p className="text-black">-</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400">Phone number</p>
                  <p className="text-black">-</p>
                </div>
                <Button className="bg-primary text-white text-xs px-4 py-1 rounded-md flex items-center gap-1">
                  <IconPencil size={14} /> Change
                </Button>
              </div>
              <div>
                <p className="text-gray-400">Gender</p>
                <p className="text-black">-</p>
              </div>
              <div>
                <p className="text-gray-400">Profession</p>
                <p className="text-black">-</p>
              </div>
              <div>
                <p className="text-gray-400">Instagram</p>
                <p className="text-black">-</p>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <p className="text-md nt-medium text-gray-700">Password</p>
            <button
              onClick={() => router.push("/profile/myAccount/change-password")}
              className="text-sm font-medium underline"
            >
              Change Password
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
