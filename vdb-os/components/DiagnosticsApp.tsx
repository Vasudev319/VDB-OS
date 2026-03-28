import React, { useState, useEffect } from 'react';
import { Activity, Cpu, MemoryStick, Wifi } from 'lucide-react';
import { ConnectionState } from './types';
import * as Config from '../config';

interface DiagnosticsAppProps {
    connectionState: ConnectionState;
}

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-bg-tertiary p-4 rounded-lg">
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="font-semibold ml-2 text-text-primary">{title}</h3>
        </div>
        <div className="text-sm text-text-secondary space-y-2">
            {children}
        </div>
    </div>
);


const ResourceMeter: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div>
        <div className="text-xs text-text-secondary mb-1 flex justify-between">
            <span>{label}</span>
            <span className="font-mono">{value.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
            <div className="h-full bg-accent-blue rounded-full transition-all duration-500" style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const NetworkTest: React.FC = () => {
    const [isTesting, setIsTesting] = useState(false);
    const [result, setResult] = useState<{ latency: number; packetLoss: number } | null>(null);

    const runTest = () => {
        setIsTesting(true);
        setResult(null);
        setTimeout(() => {
            setResult({
                latency: Math.floor(20 + Math.random() * 30),
                packetLoss: Math.random() > 0.95 ? Math.random() * 2 : 0,
            });
            setIsTesting(false);
        }, 2000);
    };

    return (
        <InfoCard icon={<Wifi size={20} className="text-accent-blue" />} title="Network Analysis">
            <div className="flex items-center gap-4">
                <button
                    onClick={runTest}
                    disabled={isTesting}
                    className="bg-accent-blue/20 text-accent-blue px-4 py-2 font-bold rounded-md hover:bg-accent-blue/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isTesting ? 'Testing...' : 'Run Test'}
                </button>
                <div className="flex-1 font-mono text-xs">
                    {isTesting && <p className="animate-pulse">Pinging VDB Mainframe...</p>}
                    {result && (
                        <div>
                            <p>Latency: <span className="text-white">{result.latency}ms</span></p>
                            <p>Packet Loss: <span className={result.packetLoss > 0 ? "text-red-500" : "text-white"}>{result.packetLoss.toFixed(1)}%</span></p>
                        </div>
                    )}
                </div>
            </div>
        </InfoCard>
    );
};


const DiagnosticsApp: React.FC<DiagnosticsAppProps> = ({ connectionState }) => {
    const [qFlux, setQFlux] = useState(0);
    const [cMatrix, setCMatrix] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setQFlux(40 + Math.random() * 50);
            setCMatrix(60 + Math.random() * 35);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app-window w-full h-full">
            <div className="app-header flex items-center justify-center gap-2">
                <Activity size={14}/>
                <span>System Diagnostics</span>
            </div>
            <div className="app-content p-6 overflow-y-auto space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard icon={<Cpu size={20} className="text-accent-blue" />} title="System Info">
                        <p><strong>OS Version:</strong> {Config.OS_NAME} {Config.OS_VERSION}</p>
                        <p><strong>Build ID:</strong> {new Date().toISOString().split('T')[0]}</p>
                    </InfoCard>

                     <InfoCard icon={<Activity size={20} className="text-accent-blue" />} title="AI Core">
                        <p><strong>Status:</strong> {connectionState.replace(/_/g, ' ')}</p>
                        <p><strong>Voice Model:</strong> {Config.VOICE_CHAT_MODEL}</p>
                         <p><strong>Text Model:</strong> {Config.TEXT_CHAT_MODEL}</p>
                    </InfoCard>
                </div>

                <InfoCard icon={<MemoryStick size={20} className="text-accent-blue" />} title="Cognitive Function Monitor">
                     <ResourceMeter label="Quantum Entanglement Flux" value={qFlux} />
                     <div className="h-3"></div>
                     <ResourceMeter label="Cognitive Matrix Load" value={cMatrix} />
                </InfoCard>

                <NetworkTest />
            </div>
        </div>
    );
};

export default DiagnosticsApp;
