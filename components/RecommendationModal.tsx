import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { TeamMember, Course, Trail, Event, Channel, Pulse, PulseType } from '../types';

interface RecommendationModalProps {
    isOpen: boolean;
    onClose: () => void;
    members: TeamMember[];
    courses: Course[];
    trails: Trail[];
    events: Event[];
    channels: Channel[];
    pulses: Pulse[];
}

type ContentType = 'course' | 'trail' | 'event' | 'channel' | 'pulse';
type SelectedContent = { type: ContentType; id: string; name: string; };
type ContentTab = 'courses' | 'trails' | 'events' | 'channels' | 'pulses';

const CONTENT_TABS: { id: ContentTab, label: string; icon: string }[] = [
    { id: 'courses', label: 'Cursos', icon: 'school' },
    { id: 'trails', label: 'Trilhas', icon: 'timeline' },
    { id: 'events', label: 'Eventos', icon: 'event' },
    { id: 'channels', label: 'Canais', icon: 'rss_feed' },
    { id: 'pulses', label: 'Pulses', icon: 'wysiwyg' },
];

export const RecommendationModal: React.FC<RecommendationModalProps> = ({
    isOpen,
    onClose,
    members,
    courses,
    trails,
    events,
    channels,
    pulses,
}) => {
    const [title, setTitle] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [selectedContent, setSelectedContent] = useState<SelectedContent[]>([]);
    const [activeContentTab, setActiveContentTab] = useState<ContentTab>('courses');
    const [searchTerms, setSearchTerms] = useState({ members: '', courses: '', trails: '', events: '', channels: '', pulses: '' });

    useEffect(() => {
        // Reset state when modal is closed
        if (!isOpen) {
            setTitle('');
            setSelectedMembers([]);
            setSelectedContent([]);
            setActiveContentTab('courses');
            setSearchTerms({ members: '', courses: '', trails: '', events: '', channels: '', pulses: '' });
        }
    }, [isOpen]);

    const handleMemberToggle = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
        );
    };

    const handleContentToggle = (item: { type: ContentType, id: string, name: string }) => {
        setSelectedContent(prev =>
            prev.some(c => c.id === item.id) ? prev.filter(c => c.id !== item.id) : [...prev, item]
        );
    };

    const handleSend = () => {
        if (!title.trim()) {
            alert('Por favor, dê um título para a recomendação.');
            return;
        }
        if (selectedMembers.length === 0) {
            alert('Por favor, selecione ao menos um liderado.');
            return;
        }
        if (selectedContent.length === 0) {
            alert('Por favor, selecione ao menos um conteúdo.');
            return;
        }

        alert(`Recomendação "${title}" enviada para ${selectedMembers.length} liderado(s) com ${selectedContent.length} conteúdo(s).`);
        onClose();
    };
    
    const handleSearch = (type: keyof typeof searchTerms, value: string) => {
        setSearchTerms(prev => ({ ...prev, [type]: value }));
    }

    const filteredData = useMemo(() => {
        const lowerCase = (str: string) => str.toLowerCase();
        return {
            members: members.filter(m => lowerCase(m.name).includes(lowerCase(searchTerms.members))),
            courses: courses.filter(c => lowerCase(c.name).includes(lowerCase(searchTerms.courses))),
            trails: trails.filter(t => lowerCase(t.name).includes(lowerCase(searchTerms.trails))),
            events: events.filter(e => lowerCase(e.name).includes(lowerCase(searchTerms.events))),
            channels: channels.filter(c => lowerCase(c.name).includes(lowerCase(searchTerms.channels))),
            pulses: pulses.filter(p => lowerCase(p.name).includes(lowerCase(searchTerms.pulses))),
        }
    }, [members, courses, trails, events, channels, pulses, searchTerms]);

    const renderContentList = () => {
        const dataMap = {
            courses: { data: filteredData.courses, type: 'course' as ContentType },
            trails: { data: filteredData.trails, type: 'trail' as ContentType },
            events: { data: filteredData.events, type: 'event' as ContentType },
            channels: { data: filteredData.channels, type: 'channel' as ContentType },
            pulses: { data: filteredData.pulses, type: 'pulse' as ContentType },
        };
        const currentData = dataMap[activeContentTab].data;
        const currentType = dataMap[activeContentTab].type;

        return (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {currentData.map(item => (
                    <li key={item.id}>
                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-purple-600 focus:ring-purple-500"
                                checked={selectedContent.some(c => c.id === item.id)}
                                onChange={() => handleContentToggle({ type: currentType, id: item.id, name: item.name })}
                            />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                        </label>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Indicar Conteúdos para a Equipe">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="rec-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Título da Recomendação</label>
                        <input
                            id="rec-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ex: Plano de Estudos - Q4"
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Liderados</label>
                        <div className="relative">
                            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar liderado..."
                                value={searchTerms.members}
                                onChange={e => handleSearch('members', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 mb-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            />
                        </div>
                        <ul className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                            {filteredData.members.map(member => (
                                <li key={member.id}>
                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-purple-600 focus:ring-purple-500"
                                            checked={selectedMembers.includes(member.id)}
                                            onChange={() => handleMemberToggle(member.id)}
                                        />
                                        <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{member.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.jobTitle}</p>
                                        </div>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column: Content Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdos</label>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="border-b border-gray-200 dark:border-gray-700 mb-3">
                            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Content Tabs">
                                {CONTENT_TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveContentTab(tab.id)}
                                        className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-xs flex items-center gap-1.5 transition-colors ${activeContentTab === tab.id ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        <Icon name={tab.icon} size="sm" /> {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="relative">
                           <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder={`Buscar em ${activeContentTab}...`}
                                value={searchTerms[activeContentTab]}
                                onChange={e => handleSearch(activeContentTab, e.target.value)}
                                className="w-full pl-10 pr-4 py-2 mb-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                            />
                        </div>
                        {renderContentList()}
                    </div>
                </div>
            </div>

            {/* Summary & Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                 <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Resumo da Recomendação</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <div>
                         <p className="font-medium text-gray-600 dark:text-gray-400">Liderados ({selectedMembers.length})</p>
                         <div className="flex flex-wrap gap-1 mt-2">
                            {selectedMembers.map(id => {
                                const member = members.find(m => m.id === id);
                                return <span key={id} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{member?.name}</span>
                            })}
                         </div>
                     </div>
                     <div>
                        <p className="font-medium text-gray-600 dark:text-gray-400">Conteúdos ({selectedContent.length})</p>
                         <ul className="text-xs space-y-1 mt-2">
                            {selectedContent.map(c => <li key={c.id} className="truncate"> - {c.name}</li>)}
                         </ul>
                     </div>
                 </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSend}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:bg-purple-400 dark:disabled:bg-purple-800 disabled:cursor-not-allowed"
                        disabled={selectedMembers.length === 0 || selectedContent.length === 0 || !title.trim()}
                    >
                        <Icon name="send" size="sm" />
                        <span>Enviar Recomendação</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};