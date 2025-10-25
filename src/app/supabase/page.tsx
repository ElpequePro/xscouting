import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Players() {
    try {
        const supabase = await createClient();
        const { data: players, error } = await supabase.from("players").select();

        if (error) {
            console.error('Error fetching players:', error);
            return <div>Error loading players: {error.message}</div>;
        }

        return <pre>{JSON.stringify(players, null, 2)}</pre>;
    } catch (err) {
        console.error('Server error:', err);
        return <div>Server error occurred. Please check the logs.</div>;
    }
}
