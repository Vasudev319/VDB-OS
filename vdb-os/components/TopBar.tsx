import React, { useState, useEffect } from 'react';
import { ConnectionState } from './types';
import { Download } from 'lucide-react';
import * as Config from '../config';

interface TopBarProps {
    connectionState: ConnectionState;
}

const TopBar: React.FC<TopBarProps> = ({ connectionState }) => {
    const [time, setTime] = useState(new Date());
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            clearInterval(timer);
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusInfo = () => {
        switch(connectionState) {
            case ConnectionState.CONNECTED: return { color: 'bg-green-500', text: 'ONLINE' };
            case ConnectionState.CONNECTING: return { color: 'bg-yellow-500 animate-pulse', text: 'CONNECTING...' };
            case ConnectionState.IDLE: return { color: 'bg-cyan-500', text: 'LISTENING' };
            case ConnectionState.REBALANCING: return { color: 'bg-orange-500 animate-pulse', text: 'REBALANCING...' };
            case ConnectionState.ERROR: return { color: 'bg-red-500', text: 'SYSTEM ERROR' };
            default: return { color: 'bg-gray-500', text: 'OFFLINE' };
        }
    };

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then(() => {
            setInstallPrompt(null);
        });
    };

    const { color, text } = getStatusInfo();

    return (
        <header className="h-8 w-full bg-bg-primary flex items-center justify-between px-4 text-xs z-40 flex-shrink-0 border-b border-border-color">
            <div className="flex items-center gap-2 text-text-secondary">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="font-medium">{text}</span>
            </div>
            <div className="font-bold text-text-primary">
                <span>{Config.OS_NAME}</span>
            </div>
            <div className="flex items-center gap-3 font-medium text-text-secondary">
                {installPrompt && (
                    <button
                        onClick={handleInstallClick}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-accent-blue text-black font-bold rounded-md hover:opacity-90"
                        title={`Install ${Config.OS_NAME}`}
                    >
                        <Download size={14} />
                        Install OS
                    </button>
                )}
                <span>{formatTime(time)}</span>
            </div>
        </header>
    );
};

export default TopBar;
