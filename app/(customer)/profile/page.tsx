"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import { getAuthenticatedUser, AuthenticatedUser } from "@/lib/auth";

export default function ProfilePage() {
  const [profile, setProfile] = useState<AuthenticatedUser["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getAuthenticatedUser();
        setProfile(data.user);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-10 text-red-500">Failed to load profile data.</div>;
  }

  return (
    <div className="max-w-full mx-auto bg-gray-100 overflow-hidden p-32 w-full min-h-screen">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 flex justify-between items-center rounded-t-xl shadow-md">
            </div>
            <div className="flex items-center justify-center gap-12 border p-6">
                <Image
                    src="/profile.jpeg"
                    alt="Profile Picture"
                    width={64}
                    height={64}
                    className="rounded-full object-cover items-start justify-self-start shadow-md"
                />
                <div className="items-start">
                    <h2 className="text-md font-semibold">{profile.name}</h2>
                    <p className="text-xs text-gray-700">{profile.email}</p>
                </div>
                <button className="bg-secondary w-auto text-white px-4 py-2 rounded-md shadow">
                Choose Image
                </button>
                </div>
          
            {/* Form */}
            <form className="p-6 space-y-6 border border-gray-200">
                <div className="flex gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
                    <input
                    type="text"
                    value={profile.name}
                    disabled
                    className="mt-1 w-full rounded border-gray-300 shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nomor Telepon</label>
                    <input
                    type="text"
                    value="#"
                    disabled
                    className="mt-1 w-full rounded border-gray-300 shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Alamat</label>
                    <input
                    type="text"
                    value="#"
                    disabled
                    className="mt-1 w-full rounded border-gray-300 shadow-sm"
                    />
                  </div>
                </div>

                {/* Email & Password Section */}
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                    My Email Address
                    </label>
                    <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{profile.email}</span>
                    <button className="text-blue-600 text-sm ml-auto">change</button>
                    </div>
                </div>
                {/* <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                    My Password
                    </label>
                    <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">***************</span>
                    <button className="text-blue-600 text-sm ml-auto">change</button>
                    </div>
                </div> */}
                </div>

                {/* Save Button */}
                <div className="text-center">
                <button
                    type="submit"
                    className="bg-[#B0A37F] text-white px-8 py-2 rounded disabled:opacity-50"
                    disabled
                >
                    Save
                </button>
                </div>
            </form>
    </div>
    </div>
  );
}
