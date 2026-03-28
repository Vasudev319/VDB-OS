import React, { useState } from 'react';
import { UserSquare, Plus, User, Trash2, X, Save, Edit } from 'lucide-react';
import { Contact } from './types';

interface ContactsAppProps {
    contacts: Contact[];
    onSave: (contacts: Contact[]) => void;
}

const ContactsApp: React.FC<ContactsAppProps> = ({ contacts, onSave }) => {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<{ id: string, name: string, phone: string, email: string }>({ id: '', name: '', phone: '', email: '' });

    const handleSelectContact = (contact: Contact) => {
        setSelectedContact(contact);
        setFormState({ ...contact, email: contact.email || '' });
    };

    const handleAddNew = () => {
        const newId = Date.now().toString();
        setSelectedContact({ id: newId, name: 'New Contact', phone: '' });
        setFormState({ id: newId, name: 'New Contact', phone: '', email: '' });
        setIsEditing(true);
    };

    const handleSave = () => {
        const { id, name, phone, email } = formState;
        if (!name.trim() || !phone.trim()) {
            alert('Name and Phone are required.');
            return;
        }

        const existing = contacts.find(c => c.id === id);
        let updatedContacts;
        if (existing) {
            updatedContacts = contacts.map(c => c.id === id ? { id, name, phone, email } : c);
        } else {
            updatedContacts = [...contacts, { id, name, phone, email }];
        }
        onSave(updatedContacts);
        setSelectedContact({ id, name, phone, email });
        setIsEditing(false);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this contact?')) {
            onSave(contacts.filter(c => c.id !== id));
            setSelectedContact(null);
        }
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <div className="app-window w-full h-full flex">
            {/* Left Panel: Contact List */}
            <div className="w-1/3 border-r border-border-color flex flex-col">
                <div className="app-header flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <UserSquare size={14} />
                        <span>Contacts ({contacts.length})</span>
                    </div>
                    <button onClick={handleAddNew} className="p-1 rounded-md hover:bg-bg-tertiary" title="Add New Contact">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="app-content flex-1 overflow-y-auto">
                    {contacts.map(contact => (
                        <button key={contact.id} onClick={() => handleSelectContact(contact)} className={`w-full text-left p-3 flex items-center gap-3 border-b border-border-color ${selectedContact?.id === contact.id ? 'bg-accent-blue/10' : ''} hover:bg-bg-tertiary transition-colors`}>
                            <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-text-primary">{contact.name}</p>
                                <p className="text-xs text-text-secondary">{contact.phone}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: Contact Details */}
            <div className="w-2/3 flex flex-col items-center justify-center">
                {selectedContact ? (
                     <div className="w-full h-full flex flex-col">
                        <div className="app-header flex justify-end items-center">
                            {isEditing ? (
                                <>
                                    <button onClick={() => { setIsEditing(false); setFormState({ ...selectedContact, email: selectedContact.email || '' }); }} className="p-1 text-red-400 rounded-md hover:bg-bg-tertiary" title="Cancel Edit"><X size={16} /></button>
                                    <button onClick={handleSave} className="p-1 text-green-400 rounded-md hover:bg-bg-tertiary ml-2" title="Save Contact"><Save size={16} /></button>
                                </>
                            ) : (
                                <>
                                     <button onClick={() => handleDelete(selectedContact.id)} className="p-1 text-red-400 rounded-md hover:bg-bg-tertiary" title="Delete Contact"><Trash2 size={16} /></button>
                                     <button onClick={() => setIsEditing(true)} className="p-1 rounded-md hover:bg-bg-tertiary ml-2" title="Edit Contact"><Edit size={16} /></button>
                                </>
                            )}
                        </div>
                        <div className="flex-1 p-8">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-bg-secondary flex items-center justify-center mb-4">
                                    <User size={64} />
                                </div>
                                <input type="text" name="name" value={formState.name} onChange={handleFormChange} readOnly={!isEditing} className={`text-2xl font-bold text-center bg-transparent w-full focus:outline-none ${isEditing ? 'border-b border-border-color' : ''}`} />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-text-secondary font-semibold">Phone</label>
                                    <input type="tel" name="phone" value={formState.phone} onChange={handleFormChange} readOnly={!isEditing} className={`w-full p-2 bg-transparent text-text-primary rounded-md ${isEditing ? 'bg-bg-primary border border-border-color' : ''}`} />
                                </div>
                                <div>
                                    <label className="text-xs text-text-secondary font-semibold">Email</label>
                                    <input type="email" name="email" value={formState.email} onChange={handleFormChange} readOnly={!isEditing} className={`w-full p-2 bg-transparent text-text-primary rounded-md ${isEditing ? 'bg-bg-primary border border-border-color' : ''}`} />
                                </div>
                            </div>
                        </div>
                     </div>
                ) : (
                    <p className="text-text-secondary">Select a contact or add a new one.</p>
                )}
            </div>
        </div>
    );
};

export default ContactsApp;
