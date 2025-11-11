export default function NewPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>New - {params.id}</h1>
    </div>
  );
}
