import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Delete, User } from 'lucide-react';
import { Contact } from './types';

interface PhoneAppProps {
    dialNumber: string | null;
    setDialNumber: (number: string | null) => void;
    contacts: Contact[];
}

type CallStatus = 'Idle' | 'Dialing...' | 'Connected' | 'Call Ended';

const PhoneApp: React.FC<PhoneAppProps> = ({ dialNumber, setDialNumber, contacts }) => {
    const [number, setNumber] = useState('');
    const [status, setStatus] = useState<CallStatus>('Idle');

    useEffect(() => {
        if (dialNumber) {
            setNumber(dialNumber.replace(/\D/g, ''));
            setStatus('Dialing...');
            const dialTimeout = setTimeout(() => {
                setStatus('Connected');
            }, 2000);
            setDialNumber(null);
            return () => clearTimeout(dialTimeout);
        }
    }, [dialNumber, setDialNumber]);

    const handleKeyPress = (key: string) => {
        if (status === 'Dialing...' || status === 'Connected' || number.length >= 15) return;
        if (status === 'Call Ended' || status === 'Idle') {
            setNumber(prev => prev + key);
            setStatus('Idle');
        }
    };

    const handleContactClick = (contactNumber: string) => {
        setNumber(contactNumber.replace(/\D/g, ''));
        handleCall(contactNumber.replace(/\D/g, ''));
    }

    const handleDelete = () => {
        if (status === 'Dialing...' || status === 'Connected') return;
        setNumber(prev => prev.slice(0, -1));
    };

    const handleCall = (numToCall = number) => {
        if (numToCall.length === 0 || (status !== 'Idle' && status !== 'Call Ended')) return;
        setStatus('Dialing...');
        setTimeout(() => {
            setStatus('Connected');
        }, 2000);
    };

    const handleHangUp = () => {
        if (status !== 'Dialing...' && status !== 'Connected') return;
        setStatus('Call Ended');
        setTimeout(() => {
            setStatus('Idle');
            setNumber('');
        }, 1500);
    };

    const keypad = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#' ];

    const getStatusColor = () => {
        switch (status) {
            case 'Dialing...': return 'text-yellow-400';
            case 'Connected': return 'text-green-400';
            case 'Call Ended': return 'text-red-500';
            default: return 'text-text-secondary';
        }
    };

    return (
        <div className="app-window w-full h-full">
            <div className="app-header flex items-center justify-center gap-2">
                <Phone size={14}/>
                <span>Phone</span>
            </div>
            <div className="app-content flex flex-col md:flex-row items-stretch justify-center p-4 gap-4">
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-xs flex flex-col items-center">
                        <div className="w-full min-h-[90px] flex items-center justify-center mb-4">
                            <div className="flex-1 text-center pl-12">
                                <p className="font-sans text-4xl h-10 tracking-wider break-all">{number || ' '}</p>
                                <p className={`text-sm h-5 font-medium ${getStatusColor()} transition-colors`}>{status !== 'Idle' && status}</p>
                            </div>
                            <div className="w-12 h-16 flex items-center justify-center">
                               {number && status !== 'Dialing...' && status !== 'Connected' && (
                                    <button onClick={handleDelete} className="text-text-secondary hover:text-text-primary transition-colors">
                                       <Delete size={24} />
                                    </button>
                               )}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 w-full">
                            {keypad.map(key => (
                                <button key={key} onClick={() => handleKeyPress(key)} className="h-16 bg-bg-tertiary text-2xl rounded-full hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue">
                                    {key}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center items-center w-full mt-8">
                            <button onClick={() => status === 'Connected' || status === 'Dialing...' ? handleHangUp() : handleCall()} className={`w-16 h-16 flex items-center justify-center rounded-full transition-colors ${status === 'Connected' || status === 'Dialing...' ? 'bg-red-600' : 'bg-green-600'}`}>
                                {status === 'Connected' || status === 'Dialing...' ? <PhoneOff size={28} /> : <Phone size={28} />}
                            </button>
                        </div>
                    </div>
                </div>
                 <div className="w-full md:w-1/2 flex flex-col p-4 border-t md:border-l md:border-t-0 border-border-color">
                    <h3 className="font-semibold text-text-secondary mb-3 text-center">Contacts</h3>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {contacts.length > 0 ? contacts.map(contact => (
                            <button key={contact.id} onClick={() => handleContactClick(contact.phone)} className="w-full text-left p-3 bg-bg-tertiary rounded-lg flex items-center gap-3 hover:bg-opacity-80 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{contact.name}</p>
                                    <p className="text-xs text-text-secondary">{contact.phone}</p>
                                </div>
                            </button>
                        )) : (
                            <div className="text-center text-sm text-text-secondary pt-10">No contacts found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhoneApp;
