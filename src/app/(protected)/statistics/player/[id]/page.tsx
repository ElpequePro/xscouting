export default function PlayerStatisticsPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Player Statistics - {params.id}</h1>
    </div>
  );
}
