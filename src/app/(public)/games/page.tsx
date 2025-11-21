import Link from "next/link";

export default function GamesPage() {
  return (
    <div>
      <h1>Games</h1>
      <Link href={'/game/tower-defense'}>Tower Defense</Link>
      <Link href={'/game/merge-tactics'}>Merge Tactics</Link>
    </div>
  );
}