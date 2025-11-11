export default function ShareTacticPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Share Tactic - {params.id}</h1>
    </div>
  );
}
