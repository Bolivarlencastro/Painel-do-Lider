import React, { useState, useMemo } from 'react';
import { Pulse, Channel, Trail, TeamMember, PulseType, SelectedItem, MemberStatus } from '../../types';
import { Icon } from '../Icon';
import { analytics } from '../../services/analytics';

interface PulseDetailProps {
  pulse: Pulse;
  allChannels: Channel[];
  allTrails: Trail[];
  allMembers: TeamMember[];
}

type DetailTab = 'consumed-by' | 'not-viewed' | 'trails';

const SimpleMemberList: React.FC<{
  items: TeamMember[], 
  emptyText: string,
}> = ({ items, emptyText }) => {
    if (items.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyText}</div>;
    return (
        <ul className="space-y-3">
            {items.map(member => (
              <li key={member.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
                <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 truncate">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={member.name}>{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.jobTitle}</p>
                </div>
              </li>
            ))}
        </ul>
    );
};


export const PulseDetail: React.FC<PulseDetailProps> = ({ pulse, allChannels, allTrails, allMembers }) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('consumed-by');

  const sourceChannel = useMemo(() => allChannels.find(c => c.id === pulse.channelId), [allChannels, pulse.channelId]);
  const associatedTrails = useMemo(() => allTrails.filter(t => t.pulseIds.includes(pulse.id)), [allTrails, pulse.id]);
  
  const membersInChannel = useMemo(() => 
    sourceChannel ? allMembers.filter(m => m.channelIds.includes(sourceChannel.id)) : [],
    [allMembers, sourceChannel]
  );
  
  const consumedByMembers = useMemo(() => membersInChannel.filter(m => m.pulseIds.includes(pulse.id)), [membersInChannel, pulse.id]);
  const notViewedMembers = useMemo(() => membersInChannel.filter(m => !m.pulseIds.includes(pulse.id)), [membersInChannel, pulse.id]);

  const getPulseTypeIcon = (type: PulseType) => {
    const iconMap: Record<PulseType, string> = {
        [PulseType.Video]: 'movie', [PulseType.Podcast]: 'podcasts', [PulseType.Imagem]: 'image',
        [PulseType.PDF]: 'picture_as_pdf', [PulseType.Word]: 'description', [PulseType.PowerPoint]: 'slideshow',
        [PulseType.Excel]: 'table_chart', [PulseType.YouTube]: 'smart_display', [PulseType.Vimeo]: 'smart_display',
        [PulseType.Link]: 'link', [PulseType.SoundCloud]: 'graphic_eq', [PulseType.GoogleDrive]: 'folder',
        [PulseType.Quiz]: 'quiz', [PulseType.Genially]: 'interactive_space', [PulseType.H5P]: 'data_object',
    };
    return iconMap[type] || 'wysiwyg';
  }
  
  const renderContent = () => {
    switch (activeTab) {
        case 'consumed-by':
            return <ConsumedByMemberList items={consumedByMembers} emptyText="Nenhum liderado da sua equipe consumiu este pulse." />;
        case 'not-viewed':
            return <SimpleMemberList items={notViewedMembers} emptyText="Todos os liderados da sua equipe visualizaram este pulse." />;
        case 'trails':
            return <TrailList items={associatedTrails} />;
        default:
            return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pulse.name}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2"><Icon name={getPulseTypeIcon(pulse.type)} size="sm"/> <span>{pulse.type}</span></div>
            <div className="flex items-center gap-2"><Icon name="timer" size="sm"/> <span>{pulse.duration}</span></div>
            {sourceChannel && <div className="flex items-center gap-2"><Icon name="hub" size="sm"/> <span>Canal: {sourceChannel.name}</span></div>}
            <div className="flex items-center gap-2"><Icon name="visibility" size="sm"/> <span>{consumedByMembers.length} Visualizações da Equipe</span></div>
          </div>
      </div>
      
      <div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            <TabButton<DetailTab> id="consumed-by" label={`Consumido por (${consumedByMembers.length})`} icon="visibility" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="not-viewed" label={`Não Visualizaram (${notViewedMembers.length})`} icon="visibility_off" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="trails" label={`Adicionado às Trilhas (${associatedTrails.length})`} icon="timeline" activeTab={activeTab} setActiveTab={setActiveTab} />
          </nav>
        </div>
        <div className="pt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const TabButton = <T extends string>({ id, label, icon, activeTab, setActiveTab }: { id: T, label: string, icon: string, activeTab: T, setActiveTab: (id: T) => void }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`
      ${activeTab === id
        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
      }
      whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
    `}
  >
    <Icon name={icon} size="sm" />
    {label}
  </button>
);

const TrailList: React.FC<{
  items: Trail[], 
}> = ({ items }) => {
    if (items.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Este pulse não faz parte de nenhuma trilha.</div>;
    return (
        <ul className="space-y-3">
            {items.map(trail => (
              <li key={trail.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
                <Icon name="timeline" className="text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 truncate" title={trail.name}>{trail.name}</span>
              </li>
            ))}
        </ul>
    );
};

const ConsumedByMemberList: React.FC<{
  items: TeamMember[], 
  emptyText: string,
}> = ({ items, emptyText }) => {
    if (items.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyText}</div>;
    return (
        <ul className="space-y-3">
            {items.map(member => {
              // Mock consumption date based on last access
              const consumptionDate = new Date(member.lastAccess);
              consumptionDate.setDate(consumptionDate.getDate() - (member.id.charCodeAt(0) % 3)); // Make it look realistic
              const formattedDate = consumptionDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

              return (
              <li key={member.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
                <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 truncate">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={member.name}>{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.jobTitle}</p>
                </div>
                <div className="ml-auto flex-shrink-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Visualizado em {formattedDate}</span>
                </div>
              </li>
            )})}
        </ul>
    );
};