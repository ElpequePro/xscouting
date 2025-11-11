export default function PlayerPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Player Details - {params.id}</h1>
    </div>
  );
}
