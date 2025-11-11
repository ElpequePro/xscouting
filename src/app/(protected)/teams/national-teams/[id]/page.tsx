export default function NationalTeamDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>National Team Detail - {params.id}</h1>
    </div>
  );
}
