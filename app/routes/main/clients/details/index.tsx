import { redirect } from 'react-router'

export async function loader({ params }: { params: { clientID: string } }) {
  return redirect(`/clients/${params.clientID}/overview`)
}

export default function ClientDetailIndex() {
  return null
}
