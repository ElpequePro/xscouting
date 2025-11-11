export default function TeamDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Team Detail - {params.id}</h1>
    </div>
  );
}
