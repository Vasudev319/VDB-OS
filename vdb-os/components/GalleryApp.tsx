import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LayoutGrid, Trash2, X, Video, Lock, Unlock, Crop, RotateCw, Save, Ban } from 'lucide-react';
import { CapturedMedia } from './types';

interface GalleryAppProps {
    items: CapturedMedia[];
    onDelete: (id: string) => void;
    onToggleVault: (id: string) => void;
    onUpdateMedia: (id: string, newDataUrl: string) => void;
    vaultPin: string | null;
    onSetVaultPin: (pin: string) => void;
}

const GalleryApp: React.FC<GalleryAppProps> = ({ items, onDelete, onToggleVault, onUpdateMedia, vaultPin, onSetVaultPin }) => {
    const [selectedItem, setSelectedItem] = useState<CapturedMedia | null>(null);
    const [showVault, setShowVault] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const publicItems = useMemo(() => items.filter(i => !i.isVaulted), [items]);
    const vaultedItems = useMemo(() => items.filter(i => i.isVaulted), [items]);

    useEffect(() => {
        if (!vaultPin) setIsSettingPin(true);
    }, [vaultPin]);

    useEffect(() => {
        if(!selectedItem) setIsEditing(false); // Reset editing state when viewer closes
    }, [selectedItem]);

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSettingPin) {
            if (pinInput.length === 4) {
                onSetVaultPin(pinInput);
                setIsSettingPin(false);
                setIsVaultUnlocked(true);
                setPinInput('');
            }
        } else {
            if (pinInput === vaultPin) {
                setIsVaultUnlocked(true);
                setPinInput('');
            } else {
                alert('Incorrect PIN');
                setPinInput('');
            }
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this item permanently?')) {
            onDelete(id);
            setSelectedItem(null);
        }
    };

    const handleToggleVaultClick = (id: string) => {
        onToggleVault(id);
        setSelectedItem(null);
    };

    const renderThumbnail = (item: CapturedMedia) => (
        <button key={item.id} onClick={() => setSelectedItem(item)} className="relative aspect-square bg-bg-tertiary rounded-lg group overflow-hidden">
            {item.type === 'photo' ? (
                <img src={item.dataUrl} alt="Captured media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
                <div className="w-full h-full flex items-center justify-center"><Video size={48} className="text-text-secondary" /></div>
            )}
             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {item.isVaulted && <Lock size={16} className="absolute top-2 right-2 text-yellow-400" />}
        </button>
    );

    const PinScreen = () => (
        <div className="absolute inset-0 bg-bg-primary z-50 flex items-center justify-center">
            <form onSubmit={handlePinSubmit} className="bg-bg-secondary p-8 rounded-lg shadow-xl flex flex-col items-center gap-4">
                <h3 className="font-semibold text-xl">{isSettingPin ? 'Set Vault PIN' : 'Enter Vault PIN'}</h3>
                <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="bg-bg-primary border border-border-color w-40 text-center text-4xl tracking-[1.5rem] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    autoFocus
                />
                <button type="submit" className="w-full bg-accent-blue text-black font-bold py-2.5 rounded-md mt-2">
                    {isSettingPin ? 'SET PIN' : 'UNLOCK'}
                </button>
                {!isSettingPin && <button type="button" onClick={() => setShowVault(false)} className="text-xs text-text-secondary mt-2 hover:underline">Cancel</button>}
            </form>
        </div>
    );

    const PhotoEditor = ({ item, onSave, onCancel }: { item: CapturedMedia, onSave: (dataUrl: string) => void, onCancel: () => void }) => {
        const imgRef = useRef<HTMLImageElement>(null);
        const [rotation, setRotation] = useState(0);

        const handleSave = () => {
            if (!imgRef.current) return;
            const img = imgRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if(!ctx) return;

            const rad = rotation * Math.PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            if (rotation % 180 === 0) {
                 canvas.width = img.naturalWidth;
                 canvas.height = img.naturalHeight;
            } else {
                 canvas.width = img.naturalHeight;
                 canvas.height = img.naturalWidth;
            }

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rad);
            ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

            onSave(canvas.toDataURL('image/jpeg'));
        };

        return (
            <div className="w-full h-full flex flex-col">
                 <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
                    <img ref={imgRef} src={item.dataUrl} alt="Editing" className="max-w-full max-h-full transition-transform duration-300" style={{ transform: `rotate(${rotation}deg)` }}/>
                 </div>
                 <div className="h-16 bg-bg-tertiary border-t border-border-color w-full flex items-center justify-center gap-4">
                     <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 flex items-center gap-2 text-text-secondary hover:text-text-primary rounded-md hover:bg-bg-secondary"><RotateCw size={18}/> Rotate</button>
                     <button className="p-2 flex items-center gap-2 text-text-secondary/50 cursor-not-allowed" title="Crop not yet implemented"><Crop size={18}/> Crop</button>
                     <button onClick={handleSave} className="p-2 flex items-center gap-2 text-green-400 hover:text-white bg-green-500/20 rounded-md"><Save size={18}/> Save</button>
                     <button onClick={onCancel} className="p-2 flex items-center gap-2 text-red-400 hover:text-white bg-red-500/20 rounded-md"><Ban size={18}/> Cancel</button>
                 </div>
            </div>
        )
    };

    const MediaViewer = () => {
        if(!selectedItem) return null;

        if (isEditing && selectedItem.type === 'photo') {
            return (
                 <div className="absolute inset-0 bg-bg-primary/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="app-window w-full h-full max-w-4xl max-h-[80vh]">
                        <PhotoEditor
                            item={selectedItem}
                            onCancel={() => setIsEditing(false)}
                            onSave={(newDataUrl) => {
                                onUpdateMedia(selectedItem.id, newDataUrl);
                                setSelectedItem(null);
                            }}
                        />
                    </div>
                </div>
            )
        }

        return (
             <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-lg">
                <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
                    {selectedItem.type === 'photo' ? (
                        <img src={selectedItem.dataUrl} alt="Full view" className="w-full h-full object-contain" />
                    ) : (
                        <video src={selectedItem.dataUrl} className="w-full h-full object-contain" controls autoPlay />
                    )}

                    <div className="absolute top-4 right-4 flex gap-2">
                         {selectedItem.type === 'photo' && <button onClick={() => setIsEditing(true)} className="p-2 rounded-full bg-bg-tertiary/80 text-text-secondary hover:text-text-primary" title="Edit Photo"><Crop size={20} /></button>}
                         <button onClick={() => handleToggleVaultClick(selectedItem.id)} className="p-2 rounded-full bg-bg-tertiary/80 text-yellow-400 hover:text-yellow-200" title={selectedItem.isVaulted ? "Move to Public" : "Move to Vault"}>
                            {selectedItem.isVaulted ? <Unlock size={20} /> : <Lock size={20} />}
                        </button>
                         <button onClick={() => handleDelete(selectedItem.id)} className="p-2 rounded-full bg-bg-tertiary/80 text-red-500 hover:text-red-400" title="Delete Permanently">
                            <Trash2 size={20} />
                        </button>
                        <button onClick={() => setSelectedItem(null)} className="p-2 rounded-full bg-bg-tertiary/80 text-text-secondary hover:text-text-primary" title="Close">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const displayedItems = showVault ? vaultedItems : publicItems;

    return (
        <div className="app-window w-full h-full">
            <div className="app-header flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <LayoutGrid size={14}/>
                    <span>{showVault ? 'Secure Vault' : 'Media Gallery'}</span>
                </div>
                <button
                    onClick={() => {
                        if (showVault) { setShowVault(false); setIsVaultUnlocked(false); }
                        else { setShowVault(true); }
                    }}
                    className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary" title={showVault ? "Public Gallery" : "Secure Vault"}>
                    {showVault ? <Unlock size={16} className="text-accent-blue"/> : <Lock size={16} />}
                </button>
            </div>
            <div className="app-content relative">
                {
                  (showVault && !isVaultUnlocked) ? <PinScreen /> :
                  displayedItems.length > 0 ? (
                    <div className="p-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                        {displayedItems.map(renderThumbnail)}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-center p-4">
                        <p className="text-text-secondary">
                           {showVault ? 'Secure Vault is empty' : 'Gallery is empty'}
                        </p>
                    </div>
                )}
            </div>
            <MediaViewer/>
        </div>
    );
};

export default GalleryApp;