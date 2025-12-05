import { supabase } from '../../lib/supabaseClient';
import LiveView from '../../components/LiveView';
import { useState } from 'react';
import Head from 'next/head';

export default function DeviceDetail({ device, media, geo }) {
  const [showLiveView, setShowLiveView] = useState(false);

  const issueCommand = async (commandType) => {
    const { error } = await supabase.from('commands').insert({
      device_uuid: device.id,
      command_type: commandType,
    });
    if (error) {
      alert(`Error issuing command: ${error.message}`);
    } else {
      alert(`Command '${commandType}' issued successfully.`);
    }
  };

  const toggleLiveView = () => {
      const command = !showLiveView ? 'STREAM_SCREEN_START' : 'STREAM_SCREEN_STOP';
      issueCommand(command);
      setShowLiveView(!showLiveView);
  };

  return (
    <div style={{ fontFamily: 'monospace', padding: '20px' }}>
      <Head><title>Asset: {device.device_id.substring(0,8)}</title></Head>
      <h1>Asset: {device.device_id}</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => issueCommand('GET_LOCATION')}>Get Location</button>
        <button onClick={() => issueCommand('CAPTURE_FRONT')}>Capture Front Cam</button>
        <button onClick={() => issueCommand('CAPTURE_BACK')}>Capture Back Cam</button>
        <button onClick={toggleLiveView} style={{backgroundColor: showLiveView ? 'red' : 'green', color: 'white'}}>
            {showLiveView ? 'Stop Live View' : 'Start Live View'}
        </button>
      </div>
      
      {showLiveView && <LiveView deviceId={device.device_id} />}

      <h2>Captured Media:</h2>
      {media.map(m => (
        <div key={m.id} style={{ border: '1px solid #444', padding: '10px', marginBottom: '10px' }}>
            <p>{m.capture_type} @ {new Date(m.timestamp).toLocaleString()}</p>
            <img src={`data:image/jpeg;base64,${m.data}`} style={{maxWidth: '800px', border: '1px solid grey'}} alt={m.capture_type} />
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const { data: device } = await supabase.from('devices').select('*').eq('id', id).single();
  const { data: media } = await supabase.from('media_captures').select('*').eq('device_uuid', id).order('timestamp', { ascending: false });
  const { data: geo } = await supabase.from('geo_logs').select('*').eq('device_uuid', id).order('timestamp', { ascending: false });
  
  return { props: { device: device || {}, media: media || [], geo: geo || [] } };
}