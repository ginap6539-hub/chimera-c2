import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import Head from 'next/head';

export default function Home({ devices }) {
  return (
    <div style={{ fontFamily: 'monospace', padding: '20px' }}>
      <Head><title>Chimera C2</title></Head>
      <h1>Project Chimera - Asset Control</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#333', color: 'white' }}>
            <th style={{ padding: '8px', border: '1px solid #555' }}>Device ID (Internal)</th>
            <th style={{ padding: '8px', border: '1px solid #555' }}>Model</th>
            <th style={{ padding: '8px', border: '1px solid #555' }}>Status</th>
            <th style={{ padding: '8px', border: '1px solid #555' }}>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id} style={{ backgroundColor: '#222', color: 'lightgrey' }}>
              <td style={{ padding: '8px', border: '1px solid #555' }}>
                <Link href={`/device/${device.id}`} style={{ color: 'cyan', textDecoration: 'none' }}>
                  {device.device_id.substring(0, 16)}...
                </Link>
              </td>
              <td style={{ padding: '8px', border: '1px solid #555' }}>{device.device_model}</td>
              <td style={{ padding: '8px', border: '1px solid #555' }}>{device.status}</td>
              <td style={{ padding: '8px', border: '1px solid #555' }}>{new Date(device.last_seen).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function getServerSideProps() {
  const { data: devices, error } = await supabase.from('devices').select('*').order('last_seen', { ascending: false });
  if (error) {
    console.error("Error fetching devices:", error);
    return { props: { devices: [] } };
  }
  return { props: { devices: devices || [] } };
}