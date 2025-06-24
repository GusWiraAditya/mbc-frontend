// components/auth/logout-button.tsx

'use client'

import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { showSuccess, showError } from "@/lib/toast"

export default function LogoutButton() {
  const router = useRouter()

 const handleLogout = async () => {
  try {
    await logout();
    showSuccess("Berhasil logout");
    router.refresh();
    router.push("/auth/login-admin"); // Ganti window.location.href
  } catch (err) {
    showError("Gagal logout");
    console.error(err);
  }
}

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  )
}