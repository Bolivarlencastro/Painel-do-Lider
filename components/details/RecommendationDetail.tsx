import React, { useState, useMemo } from 'react';
import { Recommendation, TeamMember, Course, Trail, Pulse, SelectedItem, MemberStatus } from '../../types';
import { Icon } from '../Icon';
import { ProgressBar } from '../ProgressBar';
import { StatusBadge } from '../StatusBadge';

interface RecommendationDetailProps {
  recommendation: Recommendation;
  allMembers: TeamMember[];
  allCourses: Course[];
  allTrails: Trail[];
  allPulses: Pulse[];
  onItemClick: (type: SelectedItem['type'], data: any) => void;
}

type DetailTab = 'liderados' | 'conteudos';

// Helper to get simulated progress for a single content item for a member
const getIndividualProgressOnContent = (member: TeamMember, contentId: string, contentType: 'course' | 'trail' | 'pulse'): number => {
    // Check if the member has consumed the pulse
    if (contentType === 'pulse' && member.pulseIds.includes(contentId)) {
        return 100;
    }
    if(contentType === 'pulse'){
        return 0;
    }
    
    if (member.status === MemberStatus.Completed) return 100;
    if (member.status === MemberStatus.NotStarted || member.status === MemberStatus.Empty) return 0;
    const progressSeed = member.id.charCodeAt(0) + contentId.charCodeAt(1) + contentId.length;
    if (member.status === MemberStatus.Late) return (progressSeed % 40) + 10;
    return (progressSeed % 50) + 45;
};

// Helper to get a member's progress on an entire recommendation
const getMemberProgressOnRecommendation = (member: TeamMember, recommendation: Recommendation): number => {
    const relevantContent = recommendation.content.filter(c => ['course', 'trail', 'pulse'].includes(c.type));
    if (relevantContent.length === 0) return 100;

    const totalProgress = relevantContent.reduce((acc, contentRef) => {
        return acc + getIndividualProgressOnContent(member, contentRef.id, contentRef.type as any);
    }, 0);
    
    return Math.round(totalProgress / relevantContent.length);
};

// Helper to get team's average progress on a single content item
const getTeamProgressOnContent = (contentRef: Recommendation['content'][0], memberIds: string[], allMembers: TeamMember[]): number => {
    const relevantMembers = allMembers.filter(m => memberIds.includes(m.id));
    if(relevantMembers.length === 0) return 0;
    
    const totalProgress = relevantMembers.reduce((acc, member) => {
        return acc + getIndividualProgressOnContent(member, contentRef.id, contentRef.type as any);
    }, 0);

    return Math.round(totalProgress / relevantMembers.length);
};


export const RecommendationDetail: React.FC<RecommendationDetailProps> = ({ recommendation, allMembers, allCourses, allTrails, allPulses, onItemClick }) => {
    const [activeTab, setActiveTab] = useState<DetailTab>('liderados');

    const assignedMembers = useMemo(() => allMembers.filter(m => recommendation.memberIds.includes(m.id)), [allMembers, recommendation]);
    const recommendationContent = useMemo(() => {
      const contentMap = {
        course: new Map(allCourses.map(c => [c.id, c.name])),
        trail: new Map(allTrails.map(t => [t.id, t.name])),
        pulse: new Map(allPulses.map(p => [p.id, p.name])),
        event: new Map(), // Events/Channels don't have names in this context for now
        channel: new Map(),
      };
      return recommendation.content.map(c => ({
        ...c,
        name: contentMap[c.type].get(c.id) || 'Conteúdo não encontrado'
      }));
    }, [recommendation, allCourses, allTrails, allPulses]);

    const viewedProgress = Math.round((recommendation.viewedByMemberIds.length / recommendation.memberIds.length) * 100);

    const renderContent = () => {
        switch (activeTab) {
            case 'liderados':
                return <MemberList members={assignedMembers} recommendation={recommendation} onItemClick={onItemClick} />;
            case 'conteudos':
                return <ContentList contentItems={recommendationContent} memberIds={recommendation.memberIds} allMembers={allMembers} onItemClick={onItemClick} />;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{recommendation.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <StatusBadge status={recommendation.status} />
                    {recommendation.dueDate && <div className="flex items-center gap-2"><Icon name="event_busy" size="sm"/> <span>Prazo: {new Date(recommendation.dueDate).toLocaleDateString()}</span></div>}
                    <div className="flex items-center gap-2"><Icon name="group" size="sm"/> <span>{recommendation.memberIds.length} Liderados</span></div>
                    <div className="flex items-center gap-2" title={`${recommendation.viewedByMemberIds.length} de ${recommendation.memberIds.length} liderados visualizaram`}><Icon name="visibility" size="sm"/> <span>Visualização: {viewedProgress}%</span></div>
                </div>
            </div>
            
            <div>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        <TabButton<DetailTab> id="liderados" label={`Liderados (${assignedMembers.length})`} icon="group" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton<DetailTab> id="conteudos" label={`Conteúdos (${recommendationContent.length})`} icon="checklist" activeTab={activeTab} setActiveTab={setActiveTab} />
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


const MemberList: React.FC<{
    members: TeamMember[];
    recommendation: Recommendation;
    onItemClick: (type: 'member', data: TeamMember) => void;
}> = ({ members, recommendation, onItemClick }) => {
    if (members.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum liderado nesta indicação.</div>;

    return (
        <ul className="space-y-3">
            {members.map(member => {
                const progress = getMemberProgressOnRecommendation(member, recommendation);
                const hasViewed = recommendation.viewedByMemberIds.includes(member.id);
                return (
                    <li key={member.id} onClick={() => onItemClick('member', member)} className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg transition-colors cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/80">
                        <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full" />
                        <div className="flex-1 truncate">
                            <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{member.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.jobTitle}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-4 flex-shrink-0">
                            <div title={hasViewed ? "Visualizado" : "Não Visualizado"} className="w-8 text-center">
                                <Icon name={hasViewed ? "visibility" : "visibility_off"} size="sm" className={hasViewed ? 'text-green-500' : 'text-gray-500'} />
                            </div>
                            <div className="w-12 text-center">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{progress}%</span>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

const ContentList: React.FC<{
    contentItems: (Recommendation['content'][0] & { name: string })[];
    memberIds: string[];
    allMembers: TeamMember[];
    onItemClick: (type: SelectedItem['type'], data: any) => void;
}> = ({ contentItems, memberIds, allMembers, onItemClick }) => {
    if(contentItems.length === 0) return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum conteúdo nesta indicação.</div>;

    const contentIconMap = {
        course: 'school',
        trail: 'timeline',
        pulse: 'wysiwyg',
        event: 'event',
        channel: 'rss_feed'
    };

    return (
        <ul className="space-y-3">
            {contentItems.map(content => {
                const teamProgress = getTeamProgressOnContent(content, memberIds, allMembers);
                return (
                     <li key={content.id} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <Icon name={contentIconMap[content.type]} className="text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{content.name}</span>
                        <div className="ml-auto flex items-center gap-2 w-16 text-right flex-shrink-0">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{teamProgress}%</span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};