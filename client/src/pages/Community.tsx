import { BackButton } from '@/components/BackButton'

export default function Community() {
  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-start">
      <div className="w-full max-w-3xl">
        <div className="flex items-center mb-6">
          <BackButton />
          <h1 className="ml-3 text-2xl font-semibold">Community</h1>
        </div>

        <div className="rounded-lg border p-12 flex items-center justify-center">
          <h2 className="text-lg font-medium">Community — Coming soon</h2>
        </div>
      </div>
    </div>
  )
}