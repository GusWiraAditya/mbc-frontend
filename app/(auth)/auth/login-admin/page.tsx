import AdminLoginForm from '@/components/auth/admin-login-form'

export default function LoginAdminPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-6 shadow rounded-lg">
        <h1 className="text-2xl font-bold text-center">Login Admin</h1>
        <AdminLoginForm />
      </div>
    </div>
  )
}
