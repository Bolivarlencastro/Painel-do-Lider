
import React from 'react';
import { TeamMember, Course, ConsumptionStatus, ContentItemType } from '../../types';
import { Icon } from '../Icon';
import { COURSE_CONTENT_ITEMS_DATA, MEMBER_CONTENT_PROGRESS_DATA } from '../../constants';

interface MemberCourseActivityDetailProps {
    member: TeamMember;
    course: Course;
    onBack: () => void;
}

const Kpi: React.FC<{ value: string, label: string, className?: string }> = ({ value, label, className }) => (
    <div className={`text-center sm:text-left ${className}`}>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">{value}</p>
    </div>
);

const ConsumptionStatusTag: React.FC<{ status: ConsumptionStatus }> = ({ status }) => {
    const statusMap: Record<ConsumptionStatus, string> = {
        [ConsumptionStatus.Finalizado]: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
        [ConsumptionStatus.EmAndamento]: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
        [ConsumptionStatus.NaoIniciado]: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
    };
    return (
        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status]}`}>
            {status}
        </span>
    );
};

const ContentTypeIcon: React.FC<{ type: ContentItemType }> = ({ type }) => {
    const iconMap: Record<string, string> = {
        [ContentItemType.Image]: 'image',
        [ContentItemType.Video]: 'movie',
        [ContentItemType.PDF]: 'picture_as_pdf',
        [ContentItemType.Quiz]: 'quiz',
        [ContentItemType.Link]: 'link',
    };
    return <Icon name={iconMap[type] || 'description'} className="text-purple-600 dark:text-purple-400 text-lg"/>;
}

export const MemberCourseActivityDetail: React.FC<MemberCourseActivityDetailProps> = ({ member, course, onBack }) => {
    
    const courseContent = React.useMemo(() => 
        COURSE_CONTENT_ITEMS_DATA.filter(item => item.courseId === course.id),
    [course.id]);

    const memberProgressOnCourse = React.useMemo(() => 
        MEMBER_CONTENT_PROGRESS_DATA.filter(p => p.memberId === member.id && courseContent.some(c => c.id === p.contentId)),
    [member.id, courseContent]);

    const summary = React.useMemo(() => {
        if (memberProgressOnCourse.length === 0) {
            return { points: 0, progress: 0, performance: 0, status: 'Não Iniciado', lastAccess: '-' };
        }

        const totalPoints = memberProgressOnCourse.reduce((sum, p) => sum + p.points, 0);
        const totalPerformance = memberProgressOnCourse.reduce((sum, p) => sum + p.performance, 0);
        const avgPerformance = memberProgressOnCourse.length > 0 ? Math.round(totalPerformance / memberProgressOnCourse.length) : 0;
        
        const completedCount = memberProgressOnCourse.filter(p => p.status === ConsumptionStatus.Finalizado).length;
        const progress = courseContent.length > 0 ? Math.round((completedCount / courseContent.length) * 100) : 0;

        const lastAccessDate = new Date(Math.max(...memberProgressOnCourse.map(p => new Date(p.lastAccess).getTime())));
        
        const status = progress === 100 ? 'Finalizada' : (progress > 0 ? 'Em Andamento' : 'Não Iniciado');
        
        return {
            points: totalPoints,
            progress,
            performance: avgPerformance,
            status,
            lastAccess: lastAccessDate.toLocaleDateString('pt-BR')
        };
    }, [memberProgressOnCourse, courseContent]);

    const formatSeconds = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (remainingSeconds === 0) return `${minutes}m`;
        return `${minutes}m ${remainingSeconds}s`;
    }

    return (
        <div className="p-4 sm:p-6">
            <button onClick={onBack} className="flex items-center gap-2 mb-4 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                <Icon name="arrow_back" size="sm" />
                Voltar para o perfil
            </button>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Atividades da Matrícula</h3>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center mb-6">
                <Kpi value={summary.points.toString()} label="Pontos" />
                <Kpi value={`${summary.progress}%`} label="Progresso" />
                <Kpi value={`${summary.performance}%`} label="Performance" />
                <div className="text-center sm:text-left">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
                        <span className={`h-2 w-2 rounded-full ${summary.status === 'Finalizada' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{summary.status}</span>
                    </div>
                </div>
                <Kpi value={summary.lastAccess} label="Último acesso" className="col-span-2 sm:col-span-1" />
            </div>

            <hr className="border-gray-200 dark:border-gray-700 my-6" />

            {/* Content Table */}
            <div>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-4 px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <div className="col-span-2">Conteúdo</div>
                    <div className="text-left hidden sm:block">Primeiro acesso</div>
                    <div className="text-left hidden sm:block">Último acesso</div>
                    <div className="text-left">Consumo</div>
                    <div className="text-left hidden sm:block">Duração</div>
                    <div className="text-center">Status</div>
                </div>
                <ul className="space-y-2">
                    {courseContent.map(content => {
                        const progress = memberProgressOnCourse.find(p => p.contentId === content.id);
                        return (
                            <li key={content.id} className="grid grid-cols-5 sm:grid-cols-7 gap-4 items-center px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                                <div className="col-span-2 flex items-center gap-3">
                                    <ContentTypeIcon type={content.type} />
                                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{content.name}</span>
                                </div>
                                <div className="text-left text-gray-600 dark:text-gray-300 hidden sm:block">
                                    {progress ? new Date(progress.firstAccess).toLocaleDateString('pt-BR') : '-'}
                                </div>
                                <div className="text-left text-gray-600 dark:text-gray-300 hidden sm:block">
                                    {progress ? new Date(progress.lastAccess).toLocaleDateString('pt-BR') : '-'}
                                </div>
                                <div className="text-left text-gray-600 dark:text-gray-300">
                                    {progress ? formatSeconds(progress.timeSpentSeconds) : '-'}
                                </div>
                                <div className="text-left text-gray-600 dark:text-gray-300 hidden sm:block">
                                    {formatSeconds(content.durationSeconds)}
                                </div>
                                <div className="text-center">
                                    <ConsumptionStatusTag status={progress?.status || ConsumptionStatus.NaoIniciado} />
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className="flex justify-end mt-8">
                <button className="px-6 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                    Visualizar Curso
                </button>
            </div>
        </div>
    );
};
