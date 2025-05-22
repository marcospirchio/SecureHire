import EntrevistaPage from "@/components/entrevistas/EntrevistaPage";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <EntrevistaPage token={token} />;
}
