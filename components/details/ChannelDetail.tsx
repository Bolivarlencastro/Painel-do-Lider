import React, { useState, useMemo } from 'react';
import { Channel, Pulse, TeamMember, PulseType, SelectedItem } from '../../types';
import { Icon } from '../Icon';
import { ProgressBar } from '../ProgressBar';
import { analytics } from '../../services/analytics';

interface ChannelDetailProps {
  channel: Channel;
  allPulses: Pulse[];
  allMembers: TeamMember[];
}

type DetailTab = 'members' | 'pulses' | 'not-enrolled';

const SimpleMemberList: React.FC<{
  items: TeamMember[],
  emptyText: string,
}> = ({ items, emptyText }) => {
  if (items.length === 0) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyText}</div>;
  }
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


export const ChannelDetail: React.FC<ChannelDetailProps> = ({ channel, allPulses, allMembers }) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('members');

  const associatedPulses = useMemo(() => allPulses.filter(pulse => channel.pulseIds.includes(pulse.id)), [allPulses, channel]);
  const enrolledMembers = useMemo(() => allMembers.filter(member => member.channelIds.includes(channel.id)), [allMembers, channel]);
  const notEnrolledMembers = useMemo(() => allMembers.filter(member => !member.channelIds.includes(channel.id)), [allMembers, channel]);

  const renderContent = () => {
    switch (activeTab) {
      case 'members':
        return <EnrolledMemberList items={enrolledMembers} emptyText="Nenhum liderado da sua equipe inscrito neste canal." channel={channel} />;
      case 'pulses':
        return <PulseList items={associatedPulses} allMembersInChannel={enrolledMembers} />;
      case 'not-enrolled':
        return <SimpleMemberList items={notEnrolledMembers} emptyText="Todos os liderados da sua equipe estão inscritos neste canal." />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{channel.name}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{channel.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2"><Icon name="group" size="sm"/> <span>{enrolledMembers.length} Liderados Inscritos</span></div>
            <div className="flex items-center gap-2"><Icon name="track_changes" size="sm"/> <span>{channel.pulsesCount} Pulses no Canal</span></div>
          </div>
      </div>
      
      <div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            <TabButton<DetailTab> id="members" label={`Liderados Inscritos (${enrolledMembers.length})`} icon="group" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="pulses" label={`Pulses no Canal (${associatedPulses.length})`} icon="track_changes" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton<DetailTab> id="not-enrolled" label={`Não Inscritos (${notEnrolledMembers.length})`} icon="person_off" activeTab={activeTab} setActiveTab={setActiveTab} />
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

const getPulseTypeIcon = (type: PulseType) => {
    const iconMap: Record<PulseType, string> = {
        [PulseType.Video]: 'movie', [PulseType.Podcast]: 'podcasts', [PulseType.Imagem]: 'image',
        [PulseType.PDF]: 'picture_as_pdf', [PulseType.Word]: 'description', [PulseType.PowerPoint]: 'slideshow',
        [PulseType.Excel]: 'table_chart', [PulseType.YouTube]: 'smart_display', [PulseType.Vimeo]: 'smart_display',
        [PulseType.Link]: 'link', [PulseType.SoundCloud]: 'graphic_eq', [PulseType.GoogleDrive]: 'folder',
        [PulseType.Quiz]: 'quiz', [PulseType.Genially]: 'interactive_space', [PulseType.H5P]: 'data_object',
    };
    return iconMap[type] || 'wysiwyg';
};

const PulseList: React.FC<{
  items: Pulse[], 
  allMembersInChannel: TeamMember[],
}> = ({ items, allMembersInChannel }) => {
    if (items.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum pulse neste canal.</div>;
    return (
        <ul className="space-y-3">
            {items.map(pulse => {
              const consumedBy = allMembersInChannel.filter(m => m.pulseIds.includes(pulse.id));
              return (
              <li key={pulse.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
                <Icon name={getPulseTypeIcon(pulse.type)} className="text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 truncate" title={pulse.name}>{pulse.name}</span>
                 <div className="ml-auto flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{pulse.duration}</span>
                  <div className="w-20 text-center flex items-center justify-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <Icon name="visibility" size="sm" />
                    <span className="font-medium">{consumedBy.length}</span>
                  </div>
                </div>
              </li>
            )})}
        </ul>
    );
};

const EnrolledMemberList: React.FC<{
  items: TeamMember[], 
  emptyText: string,
  channel: Channel
}> = ({ items, emptyText, channel }) => {
    if (items.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">{emptyText}</div>;
    return (
        <ul className="space-y-3">
            {items.map(member => {
                const totalPulsesInChannel = channel.pulseIds.length;
                const consumedPulses = channel.pulseIds.filter(pulseId => member.pulseIds.includes(pulseId)).length;
                const progress = totalPulsesInChannel > 0 ? Math.round((consumedPulses / totalPulsesInChannel) * 100) : 0;
                
                return (
                  <li key={member.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
                    <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 truncate">
                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={member.name}>{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.jobTitle}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3 flex-shrink-0 w-48 justify-end">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{consumedPulses} de {totalPulsesInChannel} pulses</span>
                        <div className="w-24">
                            <ProgressBar progress={progress} />
                        </div>
                    </div>
                  </li>
                );
            })}
        </ul>
    );
};