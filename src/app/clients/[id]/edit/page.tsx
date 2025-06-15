// app/clients/[id]/edit/page.tsx
'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditClientPage() {
  const { id } = useParams()
  return (
    <div className="p-8">
      <Link href={`/clients/${id}`} className="btn-secondary mb-4 inline-flex">
        <ArrowLeft size={16} className="mr-1.5" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-4">Edit Client #{id}</h1>
      <p className="text-gray-600">Edit form coming soon…</p>
    </div>
  )
}
