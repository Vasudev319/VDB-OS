import React, { useState, useEffect } from 'react';
import { Settings, BatteryCharging, Battery, MapPin, Cpu, Server } from 'lucide-react';
import * as Config from '../config';

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-bg-tertiary p-4 rounded-lg">
        <div className="flex items-center mb-2">
            {icon}
            <h3 className="font-semibold ml-2 text-text-primary">{title}</h3>
        </div>
        <div className="text-sm text-text-secondary space-y-1">
            {children}
        </div>
    </div>
);

const SettingsApp: React.FC = () => {
    const [battery, setBattery] = useState<{level: number, charging: boolean} | null>(null);
    const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((bm: any) => {
                const updateBattery = () => setBattery({ level: Math.round(bm.level * 100), charging: bm.charging });
                updateBattery();
                bm.onlevelchange = updateBattery;
                bm.onchargingchange = updateBattery;
            });
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation(pos.coords),
                () => {},
                { enableHighAccuracy: true }
            );
        }

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="app-window w-full h-full">
            <div className="app-header flex items-center justify-center gap-2">
                <Settings size={14}/>
                <span>System Settings</span>
            </div>
            <div className="app-content p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard icon={<Cpu size={20} className="text-accent-blue" />} title="System">
                        <p><strong>OS:</strong> {Config.OS_NAME} {Config.OS_VERSION}</p>
                        <p><strong>Kernel:</strong> {Config.OS_KERNEL}</p>
                        <p><strong>User:</strong> Boss Vasudev Boora</p>
                         <p><strong>System Time:</strong> {time.toLocaleTimeString()}</p>
                    </InfoCard>

                     <InfoCard icon={<Server size={20} className="text-accent-blue" />} title="Server & Network">
                        <p><strong>Domain:</strong> {Config.SERVER_DOMAIN}</p>
                        <p><strong>IP Address:</strong> {Config.SERVER_IP}</p>
                        <p><strong>Username:</strong> {Config.SERVER_USERNAME}</p>
                        <p><strong>MySQL Host:</strong> {Config.SERVER_MYSQL_HOST}</p>
                    </InfoCard>

                    <InfoCard
                        icon={battery?.charging ? <BatteryCharging size={20} className="text-accent-blue" /> : <Battery size={20} className="text-accent-blue" />}
                        title="Battery"
                    >
                        {battery ? (
                            <>
                                <p><strong>Level:</strong> {battery.level}%</p>
                                <p><strong>Status:</strong> {battery.charging ? 'Charging' : 'Discharging'}</p>
                            </>
                        ) : <p>Status unavailable</p>}
                    </InfoCard>

                    <InfoCard icon={<MapPin size={20} className="text-accent-blue" />} title="Location">
                       {location ? (
                           <>
                             <p><strong>Latitude:</strong> {location.latitude.toFixed(4)}</p>
                             <p><strong>Longitude:</strong> {location.longitude.toFixed(4)}</p>
                           </>
                       ) : <p>Location access denied</p>}
                    </InfoCard>
                </div>
                 <div className="mt-4 text-center text-xs text-text-secondary">
                    {Config.OS_NAME} | All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default SettingsApp;
