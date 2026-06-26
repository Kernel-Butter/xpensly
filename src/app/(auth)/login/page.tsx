export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-green px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-light shadow-[0_4px_12px_rgba(22,163,74,0.3)]">
            <span className="font-mono text-xl font-bold text-white">ₓ</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Xpensly</h1>
          <p className="mt-1 text-sm text-gray-500">Field expense tracker</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-center text-sm text-gray-500">Auth coming soon</p>
        </div>
      </div>
    </div>
  )
}
