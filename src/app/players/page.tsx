import { createClient } from '@/utils/supabase/server';

export default async function Players() {
    const supabase = await createClient();
    const { data: players } = await supabase.from("players").select();

    return <pre>{JSON.stringify(players, null, 2)}</pre>
}
