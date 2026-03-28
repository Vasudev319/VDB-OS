import React from 'react';
import { Terminal, Code, Camera, Settings, Power, Mic, MicOff, Phone, LayoutGrid, Loader2, Activity, UserSquare } from 'lucide-react';
import { AppType, ConnectionState } from './types';

interface DockProps {
    activeApp: AppType;
    setActiveApp: (app: AppType) => void;
    connectionState: ConnectionState;
    isMicOn: boolean;
    onMainButtonClick: () => void;
    disconnect: () => void;
    analyser: AnalyserNode | null; // Analyser is kept for potential future visualizer integrations
}

const AppIcon: React.FC<{ icon: React.ReactNode, name: string, isActive: boolean, onClick: () => void }> = ({ icon, name, isActive, onClick }) => (
    <div className="relative flex flex-col items-center group">
        <button
            onClick={onClick}
            className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 transform group-hover:-translate-y-2
            ${isActive ? 'bg-accent-blue/20 text-accent-blue' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'}`}
        >
            {icon}
        </button>
        {isActive && <div className="w-1.5 h-1.5 bg-accent-blue rounded-full mt-1.5"></div>}
    </div>
);

const Dock: React.FC<DockProps> = ({ activeApp, setActiveApp, connectionState, isMicOn, onMainButtonClick, disconnect }) => {
    const isConnected = connectionState === ConnectionState.CONNECTED;

    const MainButtonIcon = () => {
        switch (connectionState) {
            case ConnectionState.CONNECTING:
                return <Loader2 size={24} className="animate-spin text-accent-blue" />;
            case ConnectionState.CONNECTED:
                return isMicOn ? <Mic size={24} /> : <MicOff size={24} />;
            case ConnectionState.IDLE:
                 return <Power size={24} className="text-cyan-400" />;
            case ConnectionState.DISCONNECTED:
            case ConnectionState.ERROR:
            default:
                return <Power size={24} />;
        }
    };

    const getMainButtonClass = () => {
         if (isConnected && isMicOn) {
            return 'bg-blue-500 text-white animate-pulse';
         }
         if (connectionState === ConnectionState.CONNECTING) {
             return 'bg-bg-tertiary text-accent-blue';
         }
          if (connectionState === ConnectionState.IDLE) {
             return 'bg-bg-tertiary text-cyan-400';
         }
         return 'bg-bg-tertiary text-text-secondary hover:bg-opacity-80';
    }

    const appIcons = [
        { type: AppType.TERMINAL, icon: <Terminal size={24} />, name: "Terminal" },
        { type: AppType.CODE_EDITOR, icon: <Code size={24} />, name: "Code Studio" },
        { type: AppType.PHONE, icon: <Phone size={24} />, name: "Phone" },
        { type: AppType.CONTACTS, icon: <UserSquare size={24} />, name: "Contacts" },
        { type: AppType.CAMERA, icon: <Camera size={24} />, name: "Camera" },
        { type: AppType.GALLERY, icon: <LayoutGrid size={24} />, name: "Gallery" },
        { type: AppType.DIAGNOSTICS, icon: <Activity size={24} />, name: "Diagnostics" },
        { type: AppType.SETTINGS, icon: <Settings size={24} />, name: "Settings" },
    ];

    return (
        <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="h-16 px-3 flex items-center gap-2 bg-bg-secondary/80 backdrop-blur-lg rounded-xl border border-border-color shadow-2xl shadow-black/50 w-[95vw] sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {appIcons.slice(0, 4).map(app => (
                    <AppIcon key={app.type} {...app} isActive={activeApp === app.type} onClick={() => setActiveApp(app.type)} />
                ))}

                <div className="w-px h-8 bg-border-color mx-2"></div>

                <button onClick={onMainButtonClick} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${getMainButtonClass()}`}>
                    <MainButtonIcon />
                </button>

                {isConnected && (
                    <button onClick={() => disconnect()} className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors">
                        <Power size={24}/>
                    </button>
                )}

                <div className="w-px h-8 bg-border-color mx-2"></div>

                {appIcons.slice(4).map(app => (
                    <AppIcon key={app.type} {...app} isActive={activeApp === app.type} onClick={() => setActiveApp(app.type)} />
                ))}
            </div>
        </footer>
    );
};

export default Dock;
