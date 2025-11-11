export default function TeamStatisticsPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Team Statistics - {params.id}</h1>
    </div>
  );
}
