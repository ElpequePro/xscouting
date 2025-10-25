import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Players() {

    try {
        const supabase = await createClient();
        const { data: players, error } = await supabase.from("players").select();

        if (error) {
            console.error('Error fetching players:', error);
            return <div>Error loading players: {error.message}</div>;
        }

        return (
            <>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Position</th>
                            <th>Current Club</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            players.map((player) => (
                                <tr key={player.id}>
                                    <td>{player.id}</td>
                                    <td>{player.first_name}</td>
                                    <td>{player.last_name}</td>
                                    <td>{player.position}</td>
                                    <td>{player.current_club}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </>
        );
    } catch (err) {
        console.error('Server error:', err);
        return <div>Server error occurred. Please check the logs.</div>;
    }
}
