

// FIX: Added Enrollment-related types to support the new ENROLLMENTS_DATA structure.
import { TeamMember, MemberStatus, Course, CourseStatus, Trail, Event, EventType, PerformanceDataPoint, ExpiringCourseItem, TeamRankingItem, MemberRankingItem, Channel, Pulse, PulseType, CourseStructure, MemberCourseProgress, CourseContentItem, ContentItemType, MemberContentProgress, ConsumptionStatus, Enrollment, EnrollmentType, EnrollmentStatus } from './types';

// --- Date Helpers for Dynamic Mock Data ---
const today = new Date();
const daysAgo = (days: number): string => new Date(today.getTime() - (days * 24 * 60 * 60 * 1000)).toISOString();

const formatDate = (date: Date, format: 'YYYY-MM-DD' | 'DD/MM/YYYY'): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    }
    return `${day}/${month}/${year}`;
};

const daysFromNow = (days: number): string => {
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    return formatDate(futureDate, 'YYYY-MM-DD');
};

const eventDateFromNow = (days: number): string => {
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    return formatDate(futureDate, 'DD/MM/YYYY');
}

const eventDateAgo = (days: number): string => {
    const pastDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
    return formatDate(pastDate, 'DD/MM/YYYY');
}

const formatDateRange = (startDate: Date, endDate: Date): string => {
    const startDay = String(startDate.getDate()).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const year = endDate.getFullYear();

    if (startMonth === endMonth) {
      return `${startDay} a ${endDay}/${endMonth}/${year}`;
    }
    return `${startDay}/${startMonth}/${year} a ${endDay}/${endMonth}/${year}`;
};

const eventDateRangeAgo = (startDaysAgo: number, endDaysAgo: number): string => {
    const startDate = new Date(today.getTime() - (startDaysAgo * 24 * 60 * 60 * 1000));
    const endDate = new Date(today.getTime() - (endDaysAgo * 24 * 60 * 60 * 1000));
    return formatDateRange(startDate, endDate);
};

const eventDateRangeFromNow = (startDaysFromNow: number, endDaysFromNow: number): string => {
    const startDate = new Date(today.getTime() + (startDaysFromNow * 24 * 60 * 60 * 1000));
    const endDate = new Date(today.getTime() + (endDaysFromNow * 24 * 60 * 60 * 1000));
    return formatDateRange(startDate, endDate);
};


export const DAILY_PERFORMANCE_DATA: PerformanceDataPoint[] = [
    { name: 'Seg', currentPeriod: { completionRate: 70, engagement: 80, pendingTasks: 3 }, previousPeriod: { completionRate: 68, engagement: 78, pendingTasks: 4 } },
    { name: 'Ter', currentPeriod: { completionRate: 72, engagement: 82, pendingTasks: 3 }, previousPeriod: { completionRate: 69, engagement: 80, pendingTasks: 4 } },
    { name: 'Qua', currentPeriod: { completionRate: 75, engagement: 85, pendingTasks: 2 }, previousPeriod: { completionRate: 70, engagement: 81, pendingTasks: 3 } },
    { name: 'Qui', currentPeriod: { completionRate: 74, engagement: 88, pendingTasks: 2 }, previousPeriod: { completionRate: 72, engagement: 83, pendingTasks: 3 } },
    { name: 'Sex', currentPeriod: { completionRate: 78, engagement: 90, pendingTasks: 1 }, previousPeriod: { completionRate: 75, engagement: 85, pendingTasks: 2 } },
    { name: 'Sab', currentPeriod: { completionRate: 80, engagement: 91, pendingTasks: 1 }, previousPeriod: { completionRate: 78, engagement: 88, pendingTasks: 1 } },
    { name: 'Dom', currentPeriod: { completionRate: 81, engagement: 90, pendingTasks: 1 }, previousPeriod: { completionRate: 79, engagement: 87, pendingTasks: 1 } },
];

export const WEEKLY_PERFORMANCE_DATA: PerformanceDataPoint[] = [
    { name: 'Sem 1', currentPeriod: { completionRate: 65, engagement: 70, pendingTasks: 5 }, previousPeriod: { completionRate: 60, engagement: 68, pendingTasks: 6 } },
    { name: 'Sem 2', currentPeriod: { completionRate: 68, engagement: 75, pendingTasks: 4 }, previousPeriod: { completionRate: 62, engagement: 72, pendingTasks: 5 } },
    { name: 'Sem 3', currentPeriod: { completionRate: 75, engagement: 80, pendingTasks: 3 }, previousPeriod: { completionRate: 70, engagement: 78, pendingTasks: 4 } },
    { name: 'Sem 4', currentPeriod: { completionRate: 72, engagement: 82, pendingTasks: 2 }, previousPeriod: { completionRate: 68, engagement: 79, pendingTasks: 3 } },
];

export const MONTHLY_PERFORMANCE_DATA: PerformanceDataPoint[] = [
    { name: 'Jan', currentPeriod: { completionRate: 58, engagement: 65, pendingTasks: 8 }, previousPeriod: { completionRate: 55, engagement: 60, pendingTasks: 10 } },
    { name: 'Fev', currentPeriod: { completionRate: 62, engagement: 70, pendingTasks: 7 }, previousPeriod: { completionRate: 59, engagement: 68, pendingTasks: 8 } },
    { name: 'Mar', currentPeriod: { completionRate: 68, engagement: 78, pendingTasks: 5 }, previousPeriod: { completionRate: 63, engagement: 75, pendingTasks: 6 } },
    { name: 'Abr', currentPeriod: { completionRate: 71, engagement: 80, pendingTasks: 4 }, previousPeriod: { completionRate: 65, engagement: 77, pendingTasks: 5 } },
    { name: 'Mai', currentPeriod: { completionRate: 70, engagement: 82, pendingTasks: 3 }, previousPeriod: { completionRate: 68, engagement: 80, pendingTasks: 4 } },
    { name: 'Jun', currentPeriod: { completionRate: 75, engagement: 85, pendingTasks: 2 }, previousPeriod: { completionRate: 72, engagement: 83, pendingTasks: 3 } },
];


export const COURSES_DATA: Course[] = [
  { id: 'c1', name: 'Mastering Digital Skills: A Comprehensive Guide', duration: '4h 30m', students: 150, status: CourseStatus.Active, skills: ['Comunicação', 'Produtividade'], dueDate: daysFromNow(45), isExternal: true },
  { id: 'c2', name: 'Leadership Excellence: Unleashing Your Full Potential', duration: '8h', students: 75, status: CourseStatus.Active, isMandatory: true, dueDate: daysFromNow(5), skills: ['Liderança', 'Gestão de Pessoas', 'Feedback'] },
  { id: 'c3', name: 'Data Science Mastery: From Novice to Expert', duration: '22h', students: 120, status: CourseStatus.Active, skills: ['Análise de Dados', 'Data Science', 'SQL'], dueDate: daysFromNow(25) },
  { id: 'c4', name: 'Creative Writing Workshop: Unleash Your Imagination', duration: '6h', students: 90, status: CourseStatus.Active, skills: ['Comunicação', 'Criatividade'], isExternal: true, dueDate: daysFromNow(-10) },
  { id: 'c5', name: 'Financial Intelligence: Building Wealth', duration: '12h', students: 200, status: CourseStatus.Active, isMandatory: true, dueDate: daysFromNow(60), skills: ['Finanças', 'Tomada de Decisão'] },
  { id: 'c6', name: 'Compliance Training 2024', duration: '1h', students: 500, status: CourseStatus.Active, isMandatory: true, isNormativa: true, dueDate: daysFromNow(-20), skills: ['Compliance'] },
  { id: 'c7', name: 'Project Management Fundamentals', duration: '10h', students: 50, status: CourseStatus.Active, skills: ['Gestão de Projetos', 'Planejamento'], dueDate: daysFromNow(15) },
];

export const PULSES_DATA: Pulse[] = [
    { id: 'p1', name: '5 Estratégias de Venda Consultiva', channelId: 'ch1', type: PulseType.PDF, duration: '10 min', skills: ['Vendas', 'Negociação'] },
    { id: 'p2', name: 'Vídeo: Pitch de Vendas de Sucesso', channelId: 'ch1', type: PulseType.Video, duration: '15 min', skills: ['Vendas', 'Comunicação'] },
    { id: 'p3', name: 'Podcast: Entendendo o Funil de Marketing', channelId: 'ch2', type: PulseType.Podcast, duration: '25 min', skills: ['Marketing Digital'] },
    { id: 'p4', name: 'Vídeo: Lançamento de Campanhas no Google Ads', channelId: 'ch2', type: PulseType.Video, duration: '45 min', skills: ['Marketing Digital', 'Mídia Paga'] },
    { id: 'p5', name: 'A Importância da Cultura de Feedback', channelId: 'ch3', type: PulseType.Link, duration: '8 min', skills: ['Liderança', 'Feedback'] },
    { id: 'p6', name: 'PDF: Relatório Anual de Vendas', channelId: 'ch1', type: PulseType.PDF, duration: '5 min', skills: ['Vendas', 'Análise de Dados'] },
    { id: 'p7', name: 'Quiz: Conhecimentos em Marketing', channelId: 'ch2', type: PulseType.Quiz, duration: '12 min', skills: ['Marketing Digital'] },
    { id: 'p8', name: 'Link: Tutorial de CRM (YouTube)', channelId: 'ch1', type: PulseType.YouTube, duration: '22 min', skills: ['Vendas', 'Ferramentas'] },
    { id: 'p9', name: 'Apresentação: Resultados do Q3', channelId: 'ch3', type: PulseType.PowerPoint, duration: '30 min', skills: ['Liderança', 'Resultados'] },
    { id: 'p10', name: 'Planilha: Metas de Vendas Q4', channelId: 'ch1', type: PulseType.Excel, duration: 'N/A', skills: ['Vendas', 'Planejamento'] },
    { id: 'p11', name: 'Genially: Onboarding Interativo', channelId: 'ch3', type: PulseType.Genially, duration: '18 min', skills: ['Onboarding', 'Interatividade'] },
];

export const CHANNELS_DATA: Channel[] = [
    { id: 'ch1', name: 'Técnicas de Venda', description: 'Aprenda as melhores técnicas para aumentar suas vendas.', subscribers: 120, pulsesCount: 5, pulseIds: ['p1', 'p2', 'p6', 'p8', 'p10'] },
    { id: 'ch2', name: 'Marketing Digital na Prática', description: 'Canais, ferramentas e estratégias de marketing.', subscribers: 250, pulsesCount: 3, pulseIds: ['p3', 'p4', 'p7'] },
    { id: 'ch3', name: 'Liderança e Gestão', description: 'Desenvolva habilidades para liderar equipes de alta performance.', subscribers: 95, pulsesCount: 4, pulseIds: ['p5', 'p9', 'p11'] },
];


export const EXPIRING_COURSES_DATA: ExpiringCourseItem[] = [
    { memberId: '2', courseId: 'c6', dueDate: daysFromNow(-20) }, // João Silva: Vencido
    { memberId: '13', courseId: 'c6', dueDate: daysFromNow(-20) }, // Fernando Rocha: Vencido
    { memberId: '3', courseId: 'c2', dueDate: daysFromNow(5) }, // Maria Souza: Vence em 5 dias
    { memberId: '11', courseId: 'c2', dueDate: daysFromNow(5) }, // Gabriela Ferreira: Vence em 5 dias
    { memberId: '10', courseId: 'c5', dueDate: daysFromNow(60) }, // Ricardo Pereira: Vence em 60 dias
];


export const TRAILS_DATA: Trail[] = [
    { id: 't1', name: 'Onboarding de Vendas', coursesCount: 2, students: 45, courseIds: ['c1', 'c2'], pulseIds: ['p1', 'p2'], skills: ['Vendas', 'Negociação', 'Comunicação'], isMandatory: true, dueDate: daysFromNow(90) },
    { id: 't2', name: 'Desenvolvimento de Lideranças', coursesCount: 2, students: 25, courseIds: ['c2', 'c5'], pulseIds: ['p5'], skills: ['Liderança', 'Gestão de Pessoas', 'Feedback', 'Finanças'], isMandatory: true, dueDate: daysFromNow(75) },
    { id: 't3', name: 'Fundamentos de Marketing Digital', coursesCount: 1, students: 80, courseIds: ['c3'], pulseIds: ['p3', 'p4'], skills: ['Marketing Digital', 'Análise de Dados', 'Mídia Paga'] },
    { id: 't4', name: 'Excelência em Atendimento ao Cliente', coursesCount: 2, students: 110, courseIds: ['c1', 'c4'], pulseIds: [], skills: ['Comunicação', 'Atendimento ao Cliente'] },
];

export const EVENTS_DATA: Event[] = [
    { id: 'e1', name: 'Workshop de Inovação', date: eventDateAgo(45), type: EventType.Presencial, participants: 50 },
    { id: 'e2', name: 'Webinar: O Futuro do Trabalho', date: eventDateAgo(20), type: EventType.Online, participants: 300 },
    { id: 'e3', name: 'Palestra sobre Saúde Mental', date: eventDateFromNow(15), type: EventType.Online, participants: 150 },
    { id: 'e4', name: 'Hackathon Interno', date: eventDateRangeAgo(5, 3), type: EventType.Presencial, participants: 80 },
    { id: 'e5', name: 'Treinamento de Vendas Q4', date: eventDateFromNow(30), type: EventType.Online, participants: 120 },
    { id: 'e6', name: 'Conferência Anual de Liderança', date: eventDateRangeFromNow(90, 92), type: EventType.Presencial, participants: 400 },
];

// FIX: Replaced 'courseIds' with 'enrollmentIds' and moved course assignments to ENROLLMENTS_DATA.
export const TEAM_MEMBERS_DATA: TeamMember[] = [
  // LÍDERES (sem managerId)
  // ✅ CASO POSITIVO - Time engajado e ativo
  { id: '5', name: 'Beatriz Lima', jobTitle: 'Coordenadora de Vendas', avatarUrl: 'https://i.pravatar.cc/40?u=5', overallProgress: 100, coursesCompleted: 5, totalCourses: 5, trailsCompleted: 4, totalTrails: 4, status: MemberStatus.Completed, enrollmentIds: ['enr-5-c1', 'enr-5-c2', 'enr-5-c3', 'enr-5-c4', 'enr-5-c5'], trailIds: ['t1', 't2', 't3', 't4'], eventIds: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'], channelIds: ['ch1', 'ch2', 'ch3'], pulseIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11'], lastAccess: daysAgo(1), performance: 95 },
  { id: '6', name: 'Carlos Dias', jobTitle: 'Gerente de Contas Sênior', avatarUrl: 'https://i.pravatar.cc/40?u=6', overallProgress: 85, coursesCompleted: 3, totalCourses: 4, trailsCompleted: 2, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-6-c3', 'enr-6-c5'], trailIds: ['t2'], eventIds: ['e3', 'e6'], channelIds: ['ch3'], pulseIds: ['p5'], lastAccess: daysAgo(3), performance: 88 },
  
  // ⚠️ CASO NEUTRO - Performance mista
  { id: '9', name: 'Camila Alves', jobTitle: 'Especialista de Produto', avatarUrl: 'https://i.pravatar.cc/40?u=9', overallProgress: 65, coursesCompleted: 2, totalCourses: 4, trailsCompleted: 1, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-9-c1', 'enr-9-c2', 'enr-9-c3', 'enr-9-c5'], trailIds: ['t2', 't3'], eventIds: ['e1','e3', 'e6'], channelIds: ['ch2','ch3'], pulseIds: ['p3','p4','p5','p7','p9'], lastAccess: daysAgo(8), performance: 62 },
  { id: '11', name: 'Eduardo Martins', jobTitle: 'Coordenador de Suporte', avatarUrl: 'https://i.pravatar.cc/40?u=11', overallProgress: 55, coursesCompleted: 1, totalCourses: 3, trailsCompleted: 1, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-11-c1','enr-11-c2','enr-11-c5'], trailIds: ['t1', 't2'], eventIds: ['e1','e2', 'e5', 'e4'], channelIds: ['ch1'], pulseIds: ['p1','p2'], lastAccess: daysAgo(12), performance: 58 },
  
  // ❌ CASO NEGATIVO - Baixo desempenho e inatividade
  { id: '7', name: 'Fernanda Costa', jobTitle: 'Gerente de Projetos', avatarUrl: 'https://i.pravatar.cc/40?u=7', overallProgress: 25, coursesCompleted: 0, totalCourses: 3, trailsCompleted: 0, totalTrails: 2, status: MemberStatus.Late, enrollmentIds: ['enr-7-c1', 'enr-7-c5', 'enr-7-c7'], trailIds: ['t1', 't2'], eventIds: ['e5'], channelIds: ['ch1'], pulseIds: ['p1', 'p2'], lastAccess: daysAgo(45), performance: 28 },
  { id: '8', name: 'Gustavo Silva', jobTitle: 'Supervisor de Logística', avatarUrl: 'https://i.pravatar.cc/40?u=8', overallProgress: 15, coursesCompleted: 0, totalCourses: 2, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.Late, enrollmentIds: ['enr-8-c3', 'enr-8-c7'], trailIds: ['t3'], eventIds: ['e1', 'e4'], channelIds: ['ch2'], pulseIds: [], lastAccess: daysAgo(62), performance: 18 },
  { id: '10', name: 'Helena Oliveira', jobTitle: 'Coordenadora de TI', avatarUrl: 'https://i.pravatar.cc/40?u=10', overallProgress: 10, coursesCompleted: 0, totalCourses: 2, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.NotStarted, enrollmentIds: ['enr-10-c1','enr-10-c5'], trailIds: ['t1','t2'], eventIds: ['e2', 'e4'], channelIds: ['ch1','ch3'], pulseIds: ['p1','p2','p5'], lastAccess: daysAgo(90), performance: 12 },
  
  { id: '1', name: 'Ana Clara', jobTitle: 'Analista de RH', avatarUrl: 'https://i.pravatar.cc/40?u=1', overallProgress: 0, coursesCompleted: 0, totalCourses: 0, trailsCompleted: 0, totalTrails: 0, status: MemberStatus.Empty, enrollmentIds: [], trailIds: [], eventIds: ['e2'], channelIds: [], pulseIds: [], lastAccess: daysAgo(90) },

  // LIDERADOS (com managerId)
  
  // ✅ Time Beatriz Lima (id: 5) - CASO POSITIVO: Alta performance
  { id: '21', name: 'Gabriela Ferreira', jobTitle: 'Vendedora Pleno', managerId: '5', avatarUrl: 'https://i.pravatar.cc/40?u=21', overallProgress: 95, coursesCompleted: 4, totalCourses: 4, trailsCompleted: 2, totalTrails: 2, status: MemberStatus.Completed, enrollmentIds: ['enr-21-c1','enr-21-c2','enr-21-c5'], trailIds: ['t1', 't2'], eventIds: ['e1','e2', 'e5', 'e4'], channelIds: ['ch1'], pulseIds: ['p1','p2'], lastAccess: daysAgo(1), performance: 92 },
  { id: '22', name: 'João Silva', jobTitle: 'Vendedor Sênior', managerId: '5', avatarUrl: 'https://i.pravatar.cc/40?u=22', overallProgress: 88, coursesCompleted: 3, totalCourses: 3, trailsCompleted: 2, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-22-c1', 'enr-22-c5', 'enr-22-c2'], trailIds: ['t1', 't2'], eventIds: ['e2', 'e5', 'e4'], channelIds: ['ch1', 'ch3'], pulseIds: ['p1', 'p5', 'p6', 'p9'], lastAccess: daysAgo(2), performance: 85 },
  { id: '23', name: 'Juliana Costa', jobTitle: 'Vendedora Pleno', managerId: '5', avatarUrl: 'https://i.pravatar.cc/40?u=23', overallProgress: 82, coursesCompleted: 3, totalCourses: 4, trailsCompleted: 1, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-23-c1', 'enr-23-c5'], trailIds: ['t1', 't2'], eventIds: ['e5'], channelIds: ['ch1'], pulseIds: ['p1', 'p2'], lastAccess: daysAgo(3), performance: 80 },

  // ✅ Time Carlos Dias (id: 6) - CASO POSITIVO: Boa performance
  { id: '24', name: 'Ricardo Pereira', jobTitle: 'Gerente de Contas', managerId: '6', avatarUrl: 'https://i.pravatar.cc/40?u=24', overallProgress: 90, coursesCompleted: 3, totalCourses: 3, trailsCompleted: 2, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-24-c1','enr-24-c5'], trailIds: ['t1','t2'], eventIds: ['e2', 'e4'], channelIds: ['ch1','ch3'], pulseIds: ['p1','p2','p5'], lastAccess: daysAgo(2), performance: 88 },
  { id: '25', name: 'Lucas Martins', jobTitle: 'Gerente de Contas Jr', managerId: '6', avatarUrl: 'https://i.pravatar.cc/40?u=25', overallProgress: 78, coursesCompleted: 2, totalCourses: 3, trailsCompleted: 1, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-25-c1','enr-25-c3'], trailIds: ['t4'], eventIds: ['e3', 'e6'], channelIds: ['ch1', 'ch2'], pulseIds: ['p1','p3','p8'], lastAccess: daysAgo(5), performance: 75 },

  // ⚠️ Time Camila Alves (id: 9) - CASO NEUTRO: Performance mista
  { id: '31', name: 'Maria Souza', jobTitle: 'Analista de Marketing', managerId: '9', avatarUrl: 'https://i.pravatar.cc/40?u=31', overallProgress: 70, coursesCompleted: 2, totalCourses: 3, trailsCompleted: 1, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-31-c1', 'enr-31-c2', 'enr-31-c3'], trailIds: ['t3'], eventIds: ['e1', 'e6', 'e4'], channelIds: ['ch2'], pulseIds: ['p3', 'p7'], lastAccess: daysAgo(7), performance: 68 },
  { id: '32', name: 'Rafael Martins', jobTitle: 'Estagiário de Marketing', managerId: '9', avatarUrl: 'https://i.pravatar.cc/40?u=32', overallProgress: 45, coursesCompleted: 1, totalCourses: 3, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.OnTrack, enrollmentIds: ['enr-32-c3'], trailIds: ['t3'], eventIds: ['e1', 'e4'], channelIds: ['ch2'], pulseIds: [], lastAccess: daysAgo(15), performance: 48 },

  // ⚠️ Time Eduardo Martins (id: 11) - CASO NEUTRO: Alguns problemas
  { id: '33', name: 'Paula Santos', jobTitle: 'Analista de Suporte', managerId: '11', avatarUrl: 'https://i.pravatar.cc/40?u=33', overallProgress: 60, coursesCompleted: 1, totalCourses: 2, trailsCompleted: 1, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-33-c1'], trailIds: ['t1'], eventIds: ['e2'], channelIds: ['ch1'], pulseIds: ['p1'], lastAccess: daysAgo(10), performance: 58 },
  { id: '34', name: 'Diego Lima', jobTitle: 'Técnico de Suporte', managerId: '11', avatarUrl: 'https://i.pravatar.cc/40?u=34', overallProgress: 35, coursesCompleted: 0, totalCourses: 2, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.Late, enrollmentIds: ['enr-34-c2'], trailIds: ['t1'], eventIds: [], channelIds: [], pulseIds: [], lastAccess: daysAgo(20), performance: 38 },

  // ❌ Time Fernanda Costa (id: 7) - CASO NEGATIVO: Baixo engajamento
  { id: '41', name: 'Pedro Henrique', jobTitle: 'Analista de Projetos', managerId: '7', avatarUrl: 'https://i.pravatar.cc/40?u=41', overallProgress: 30, coursesCompleted: 0, totalCourses: 2, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.Late, enrollmentIds: ['enr-41-c1', 'enr-41-c4'], trailIds: ['t4'], eventIds: ['e1', 'e4'], channelIds: [], pulseIds: [], lastAccess: daysAgo(40), performance: 32 },
  { id: '42', name: 'Carla Almeida', jobTitle: 'Coordenadora de Projetos', managerId: '7', avatarUrl: 'https://i.pravatar.cc/40?u=42', overallProgress: 20, coursesCompleted: 0, totalCourses: 2, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.Late, enrollmentIds: ['enr-42-c2'], trailIds: ['t1'], eventIds: [], channelIds: [], pulseIds: [], lastAccess: daysAgo(55), performance: 22 },

  // ❌ Time Gustavo Silva (id: 8) - CASO NEGATIVO: Muito atrasado
  { id: '43', name: 'Fernando Rocha', jobTitle: 'Analista de Logística', managerId: '8', avatarUrl: 'https://i.pravatar.cc/40?u=43', overallProgress: 15, coursesCompleted: 0, totalCourses: 2, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.Late, enrollmentIds: ['enr-43-c6', 'enr-43-c3'], trailIds: ['t1'], eventIds: [], channelIds: ['ch1'], pulseIds: [], lastAccess: daysAgo(60), performance: 18 },
  { id: '44', name: 'Renata Gonçalves', jobTitle: 'Assistente de Logística', managerId: '8', avatarUrl: 'https://i.pravatar.cc/40?u=44', overallProgress: 5, coursesCompleted: 0, totalCourses: 1, trailsCompleted: 0, totalTrails: 0, status: MemberStatus.NotStarted, enrollmentIds: ['enr-44-c1'], trailIds: [], eventIds: [], channelIds: [], pulseIds: [], lastAccess: daysAgo(75), performance: 8 },

  // ❌ Time Helena Oliveira (id: 10) - CASO NEGATIVO: Inativo
  { id: '45', name: 'Thiago Barbosa', jobTitle: 'Analista de TI', managerId: '10', avatarUrl: 'https://i.pravatar.cc/40?u=45', overallProgress: 10, coursesCompleted: 0, totalCourses: 1, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.NotStarted, enrollmentIds: ['enr-45-c5'], trailIds: ['t2'], eventIds: [], channelIds: [], pulseIds: [], lastAccess: daysAgo(80), performance: 12 },
  { id: '46', name: 'Vanessa Costa', jobTitle: 'Técnica de TI', managerId: '10', avatarUrl: 'https://i.pravatar.cc/40?u=46', overallProgress: 8, coursesCompleted: 0, totalCourses: 1, trailsCompleted: 0, totalTrails: 0, status: MemberStatus.NotStarted, enrollmentIds: ['enr-46-c3'], trailIds: [], eventIds: [], channelIds: [], pulseIds: [], lastAccess: daysAgo(95), performance: 10 },
];


// FIX: Added ENROLLMENTS_DATA to handle course assignments correctly.
export const ENROLLMENTS_DATA: Enrollment[] = [
    // João Silva (2)
    { id: 'enr-2-c1', memberId: '2', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 40, status: EnrollmentStatus.Iniciada },
    { id: 'enr-2-c2', memberId: '2', courseId: 'c2', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(1), progress: 70, status: EnrollmentStatus.ReqNovoPrazo },
    { id: 'enr-2-c5', memberId: '2', courseId: 'c5', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(60), progress: 20, status: EnrollmentStatus.Iniciada },
    { id: 'enr-2-c6', memberId: '2', courseId: 'c6', type: EnrollmentType.Obrigatoria, isNormativa: true, dueDate: daysFromNow(-20), progress: 15, status: EnrollmentStatus.Expirada },
    // Fernando Rocha (13)
    { id: 'enr-13-c6', memberId: '13', courseId: 'c6', type: EnrollmentType.Obrigatoria, isNormativa: true, dueDate: daysFromNow(-20), progress: 5, status: EnrollmentStatus.Expirada },
    { id: 'enr-13-c3', memberId: '13', courseId: 'c3', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(25), progress: 10, status: EnrollmentStatus.Iniciada },
    // Maria Souza (3)
    { id: 'enr-3-c1', memberId: '3', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 100, status: EnrollmentStatus.AgAprovacao },
    { id: 'enr-3-c2', memberId: '3', courseId: 'c2', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(5), progress: 85, status: EnrollmentStatus.Iniciada },
    { id: 'enr-3-c3', memberId: '3', courseId: 'c3', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(25), progress: 50, status: EnrollmentStatus.Iniciada },
    // Gabriela Ferreira (11)
    { id: 'enr-11-c1', memberId: '11', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-11-c2', memberId: '11', courseId: 'c2', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(5), progress: 90, status: EnrollmentStatus.Iniciada },
    { id: 'enr-11-c5', memberId: '11', courseId: 'c5', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(60), progress: 70, status: EnrollmentStatus.Iniciada },
    // Juliana Costa (7)
    { id: 'enr-7-c1', memberId: '7', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-7-c5', memberId: '7', courseId: 'c5', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(60), progress: 30, status: EnrollmentStatus.Iniciada },
    { id: 'enr-7-c7', memberId: '7', courseId: 'c7', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(15), progress: 10, status: EnrollmentStatus.Iniciada },
    // Lucas Martins (12)
    { id: 'enr-12-c1', memberId: '12', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 60, status: EnrollmentStatus.Iniciada },
    { id: 'enr-12-c3', memberId: '12', courseId: 'c3', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(25), progress: 50, status: EnrollmentStatus.Iniciada },
    // Beatriz Lima (5) - Finalizado
    { id: 'enr-5-c1', memberId: '5', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-5-c2', memberId: '5', courseId: 'c2', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(5), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-5-c3', memberId: '5', courseId: 'c3', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(25), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-5-c4', memberId: '5', courseId: 'c4', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(-10), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-5-c5', memberId: '5', courseId: 'c5', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(60), progress: 100, status: EnrollmentStatus.Finalizado },
    // Camila Alves (9)
    { id: 'enr-9-c1', memberId: '9', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-9-c2', memberId: '9', courseId: 'c2', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(5), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-9-c3', memberId: '9', courseId: 'c3', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(25), progress: 90, status: EnrollmentStatus.Iniciada },
    { id: 'enr-9-c5', memberId: '9', courseId: 'c5', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(60), progress: 80, status: EnrollmentStatus.Iniciada },
    // Ricardo Pereira (10)
    { id: 'enr-10-c1', memberId: '10', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-10-c5', memberId: '10', courseId: 'c5', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(60), progress: 50, status: EnrollmentStatus.Iniciada },
    // Carlos Dias (6)
    { id: 'enr-6-c3', memberId: '6', courseId: 'c3', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(25), progress: 100, status: EnrollmentStatus.Finalizado },
    { id: 'enr-6-c5', memberId: '6', courseId: 'c5', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(60), progress: 20, status: EnrollmentStatus.Iniciada },
    // Pedro Henrique (4)
    { id: 'enr-4-c1', memberId: '4', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 20, status: EnrollmentStatus.Iniciada },
    { id: 'enr-4-c2', memberId: '4', courseId: 'c2', type: EnrollmentType.Obrigatoria, isNormativa: false, dueDate: daysFromNow(-5), progress: 10, status: EnrollmentStatus.Reprovada },
    { id: 'enr-4-c4', memberId: '4', courseId: 'c4', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(-10), progress: 20, status: EnrollmentStatus.Iniciada },
    // Rafael Martins (8)
    { id: 'enr-8-c3', memberId: '8', courseId: 'c3', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(25), progress: 0, status: EnrollmentStatus.Matriculado },
    { id: 'enr-8-c7', memberId: '8', courseId: 'c7', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(15), progress: 15, status: EnrollmentStatus.Desistiu },
    // Renata Gonçalves (14)
    { id: 'enr-14-c1', memberId: '14', courseId: 'c1', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(45), progress: 0, status: EnrollmentStatus.Matriculado },
    { id: 'enr-14-c4', memberId: '14', courseId: 'c4', type: EnrollmentType.Livre, isNormativa: false, dueDate: daysFromNow(10), progress: 5, status: EnrollmentStatus.Inativa },
];


// FIX: Completed the TEAM_RANKING_DATA array which was truncated.
export const TEAM_RANKING_DATA: TeamRankingItem[] = [
    { id: 'team1', rank: 1, name: 'Vendas', points: 12500, trend: 'up' },
    { id: 'team2', rank: 2, name: 'Marketing', points: 11800, trend: 'down' },
    { id: 'team3', rank: 3, name: 'Produto', points: 11500, trend: 'up' },
];

// FIX: Added missing MEMBER_RANKING_DATA constant.
export const MEMBER_RANKING_DATA: MemberRankingItem[] = [
    { id: '5', rank: 1, name: 'Beatriz Lima', avatarUrl: 'https://i.pravatar.cc/40?u=5', jobTitle: 'Coordenadora de Vendas', points: 2800, trend: 'up' },
    { id: '9', rank: 2, name: 'Camila Alves', avatarUrl: 'https://i.pravatar.cc/40?u=9', jobTitle: 'Especialista de Produto', points: 2650, trend: 'up' },
    { id: '11', rank: 3, name: 'Gabriela Ferreira', avatarUrl: 'https://i.pravatar.cc/40?u=11', jobTitle: 'Vendedora Pleno', points: 2500, trend: 'down' },
    { id: '10', rank: 4, name: 'Ricardo Pereira', avatarUrl: 'https://i.pravatar.cc/40?u=10', jobTitle: 'Gerente de Contas', points: 2400, trend: 'up' },
    { id: '3', rank: 5, name: 'Maria Souza', avatarUrl: 'https://i.pravatar.cc/40?u=3', jobTitle: 'Analista de Marketing', points: 2200, trend: 'neutral' },
    { id: '6', rank: 6, name: 'Carlos Dias', avatarUrl: 'https://i.pravatar.cc/40?u=6', jobTitle: 'Gerente de Contas Sênior', points: 2150, trend: 'down' },
    { id: '12', rank: 7, name: 'Lucas Martins', avatarUrl: 'https://i.pravatar.cc/40?u=12', jobTitle: 'Gerente de Contas Jr', points: 1900, trend: 'up' },
    { id: '7', rank: 8, name: 'Juliana Costa', avatarUrl: 'https://i.pravatar.cc/40?u=7', jobTitle: 'Vendedora Pleno', points: 1500, trend: 'neutral' },
    { id: '2', rank: 9, name: 'João Silva', avatarUrl: 'https://i.pravatar.cc/40?u=2', jobTitle: 'Vendedor Sênior', points: 1200, trend: 'down' },
    { id: '4', rank: 10, name: 'Pedro Henrique', avatarUrl: 'https://i.pravatar.cc/40?u=4', jobTitle: 'Vendedor Júnior', points: 900, trend: 'neutral' },
    { id: '8', rank: 11, name: 'Rafael Martins', avatarUrl: 'https://i.pravatar.cc/40?u=8', jobTitle: 'Estagiário de Marketing', points: 750, trend: 'up' },
    { id: '13', rank: 12, name: 'Fernando Rocha', avatarUrl: 'https://i.pravatar.cc/40?u=13', jobTitle: 'Analista de Vendas', points: 600, trend: 'down' },
    { id: '14', rank: 13, name: 'Renata Gonçalves', avatarUrl: 'https://i.pravatar.cc/40?u=14', jobTitle: 'Assistente de Vendas', points: 400, trend: 'neutral' },
    { id: '1', rank: 14, name: 'Ana Clara', avatarUrl: 'https://i.pravatar.cc/40?u=1', jobTitle: 'Analista de RH', points: 100, trend: 'neutral' },
];

// FIX: Added missing COURSE_CONTENT_ITEMS_DATA constant.
export const COURSE_CONTENT_ITEMS_DATA: CourseContentItem[] = [
    // Course c1: Mastering Digital Skills
    { id: 'cc1-1', courseId: 'c1', name: 'Introdução às Skills Digitais', type: ContentItemType.Video, durationSeconds: 300 },
    { id: 'cc1-2', courseId: 'c1', name: 'Comunicação Efetiva Online', type: ContentItemType.Video, durationSeconds: 600 },
    { id: 'cc1-3', courseId: 'c1', name: 'Quiz: Comunicação', type: ContentItemType.Quiz, durationSeconds: 180 },
    { id: 'cc1-4', courseId: 'c1', name: 'Gestão de Tempo e Produtividade', type: ContentItemType.PDF, durationSeconds: 420 },

    // Course c2: Leadership Excellence
    { id: 'cc2-1', courseId: 'c2', name: 'O Papel do Líder', type: ContentItemType.Video, durationSeconds: 900 },
    { id: 'cc2-2', courseId: 'c2', name: 'Técnicas de Feedback', type: ContentItemType.Video, durationSeconds: 1200 },
    { id: 'cc2-3', courseId: 'c2', name: 'Gestão de Conflitos', type: ContentItemType.Link, durationSeconds: 600 },
    { id: 'cc2-4', courseId: 'c2', name: 'Quiz Final de Liderança', type: ContentItemType.Quiz, durationSeconds: 300 },
    
    // Course c3: Data Science Mastery
    { id: 'cc3-1', courseId: 'c3', name: 'Módulo 1: Introdução a Data Science', type: ContentItemType.Video, durationSeconds: 1800 },
    { id: 'cc3-2', courseId: 'c3', name: 'Módulo 2: SQL para Análise', type: ContentItemType.Video, durationSeconds: 3600 },

    // Course c6: Compliance Training 2024
    { id: 'cc6-1', courseId: 'c6', name: 'Políticas de Compliance', type: ContentItemType.PDF, durationSeconds: 1800 },
    { id: 'cc6-2', courseId: 'c6', name: 'Teste de Conhecimento', type: ContentItemType.Quiz, durationSeconds: 1800 },
];

// FIX: Added missing MEMBER_CONTENT_PROGRESS_DATA constant.
export const MEMBER_CONTENT_PROGRESS_DATA: MemberContentProgress[] = [
    // Maria Souza (3) on course c2
    { memberId: '3', contentId: 'cc2-1', firstAccess: daysAgo(7), lastAccess: daysAgo(6), timeSpentSeconds: 900, status: ConsumptionStatus.Finalizado, points: 50, performance: 100 },
    { memberId: '3', contentId: 'cc2-2', firstAccess: daysAgo(5), lastAccess: daysAgo(5), timeSpentSeconds: 1000, status: ConsumptionStatus.EmAndamento, points: 30, performance: 80 },
    
    // João Silva (2) on course c1
    { memberId: '2', contentId: 'cc1-1', firstAccess: daysAgo(10), lastAccess: daysAgo(10), timeSpentSeconds: 300, status: ConsumptionStatus.Finalizado, points: 20, performance: 100 },
    { memberId: '2', contentId: 'cc1-2', firstAccess: daysAgo(9), lastAccess: daysAgo(9), timeSpentSeconds: 200, status: ConsumptionStatus.EmAndamento, points: 5, performance: 30 },
    
    // João Silva (2) on course c6 (compliance)
    { memberId: '2', contentId: 'cc6-1', firstAccess: daysAgo(25), lastAccess: daysAgo(22), timeSpentSeconds: 900, status: ConsumptionStatus.EmAndamento, points: 5, performance: 15 },
    
    // Fernando Rocha (13) on course c6 (compliance)
    { memberId: '13', contentId: 'cc6-1', firstAccess: daysAgo(22), lastAccess: daysAgo(22), timeSpentSeconds: 300, status: ConsumptionStatus.EmAndamento, points: 0, performance: 5 },
];

// --- PERSONAS FOR PROTOTYPE SIMULATION ---
import { Persona } from './types';

export const PERSONAS: Persona[] = [
  {
    id: 'persona-leader-1',
    name: 'Beatriz Lima',
    jobTitle: 'Coordenadora de Vendas',
    avatarUrl: 'https://i.pravatar.cc/40?u=5',
    role: 'leader',
    description: 'Lidera equipe de 6 vendedores. Vê apenas seu time no Painel do Líder.',
  },
  {
    id: 'persona-director-positive',
    name: 'Maria Fernandes',
    jobTitle: 'Diretora de Vendas',
    avatarUrl: 'https://i.pravatar.cc/40?u=director',
    role: 'director',
    description: '✅ Caso POSITIVO: Equipe engajada, boas taxas de conclusão, líderes ativos (Beatriz, Carlos).',
    managedLeaderIds: ['5', '6'], // Gerencia Beatriz e Carlos (times com bom desempenho)
  },
  {
    id: 'persona-director-neutral',
    name: 'Paulo Silva',
    jobTitle: 'Diretor de Operações',
    avatarUrl: 'https://i.pravatar.cc/40?u=paulo',
    role: 'director',
    description: '⚠️ Caso NEUTRO: Performance mista, alguns líderes precisam atenção (Camila, Eduardo).',
    managedLeaderIds: ['9', '11'], // Gerencia Camila e Eduardo (performance mediana)
  },
  {
    id: 'persona-director-negative',
    name: 'Carla Santos',
    jobTitle: 'Diretora Comercial',
    avatarUrl: 'https://i.pravatar.cc/40?u=carla',
    role: 'director',
    description: '❌ Caso NEGATIVO: Baixo engajamento, muitos atrasos, líderes inativos (Fernanda, Gustavo, Helena).',
    managedLeaderIds: ['7', '8', '10'], // Gerencia Fernanda, Gustavo, Helena (times com problemas)
  },
];
