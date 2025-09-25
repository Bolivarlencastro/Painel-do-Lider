
import React from 'react';
import { TeamMember, Channel, Pulse } from '../../types';
import { Icon } from '../Icon';

interface MemberChannelProgressDetailProps {
    member: TeamMember;
    channel: Channel;
    allPulses: Pulse[];
    onBack: () => void;
}

export const MemberChannelProgressDetail: React.FC<MemberChannelProgressDetailProps> = ({ member, channel, allPulses, onBack }) => {
    const pulsesInChannel = allPulses.filter(pulse => channel.pulseIds.includes(pulse.id));

    return (
        <div className="p-4 sm:p-6">
            <button onClick={onBack} className="flex items-center gap-2 mb-4 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                <Icon name="arrow_back" size="sm" />
                Voltar para o perfil de {member.name}
            </button>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Consumo no Canal: {channel.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Veja os pulses que {member.name} visualizou neste canal.</p>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/60">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pulse no Canal</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status de Visualização</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700/60">
                        {pulsesInChannel.map(pulse => {
                            const hasViewed = member.pulseIds.includes(pulse.id);
                            const consumptionDate = new Date(member.lastAccess);
                            consumptionDate.setDate(consumptionDate.getDate() - (member.id.charCodeAt(0) % 5));
                            const formattedDate = consumptionDate.toLocaleDateString('pt-BR');

                            return (
                                <tr key={pulse.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{pulse.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        {hasViewed ? (
                                            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                                                <Icon name="visibility" size="sm" />
                                                <span className="font-medium">Visualizado em {formattedDate}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Icon name="visibility_off" size="sm" />
                                                <span className="font-medium">Não Visualizado</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {pulsesInChannel.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    Este canal não possui pulses.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
