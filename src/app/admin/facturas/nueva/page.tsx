import InvoiceForm from '@/components/admin/InvoiceForm'

export default async function NuevaFacturaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>
}) {
  const { cliente } = await searchParams
  return <InvoiceForm initialClientId={cliente} />
}
