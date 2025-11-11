export default function ComparePlayerPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Compare Player - {params.id}</h1>
    </div>
  );
}
