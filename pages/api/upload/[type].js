import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Helper function to get device UUID from its hardware ID
async function getDeviceUUID(deviceId) {
    const { data, error } = await supabase
        .from('devices')
        .select('id')
        .eq('device_id', deviceId)
        .single();
    if (error || !data) return null;
    return data.id;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type } = req.query;
    const { device_id, ...payload } = req.body;

    if (!device_id) {
        return res.status(400).json({ error: 'device_id is required' });
    }

    const deviceUUID = await getDeviceUUID(device_id);
    if (!deviceUUID) {
        return res.status(404).json({ error: 'Device not registered' });
    }

    let insertData;
    let tableName;

    switch (type) {
        case 'geo':
            tableName = 'geo_logs';
            insertData = {
                device_uuid: deviceUUID,
                latitude: payload.latitude,
                longitude: payload.longitude
            };
            break;
        case 'media':
            tableName = 'media_captures';
            insertData = {
                device_uuid: deviceUUID,
                capture_type: payload.capture_type,
                data: payload.data
            };
            break;
        default:
            return res.status(400).json({ error: 'Invalid upload type' });
    }
    
    // Perform the data insertion
    const { error: insertError } = await supabase.from(tableName).insert(insertData);
    if (insertError) {
        console.error(`Upload Error (${type}):`, insertError.message);
        return res.status(500).json({ error: `Failed to upload ${type} data` });
    }

    // Update the last_seen timestamp as a sign of life
    await supabase.from('devices').update({ last_seen: new Date().toISOString() }).eq('id', deviceUUID);

    res.status(200).json({ status: 'received' });
}