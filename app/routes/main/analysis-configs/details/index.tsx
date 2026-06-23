import { redirect } from 'react-router'

export async function loader({ params }: { params: { analysisConfigID: string } }) {
  return redirect(`/analysis-configs/${params.analysisConfigID}/overview`)
}

export default function AnalysisConfigDetailIndex() {
  return null
}
