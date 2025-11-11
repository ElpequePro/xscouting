export default function TacticDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Tactic Detail - {params.id}</h1>
    </div>
  );
}
