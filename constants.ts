

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
  // --- Cenário 1: EM RISCO (Obrigatório Expirada) ---
  { id: '2', name: 'João Silva', jobTitle: 'Vendedor Sênior', avatarUrl: 'https://i.pravatar.cc/40?u=2', overallProgress: 25, coursesCompleted: 1, totalCourses: 3, trailsCompleted: 1, totalTrails: 2, status: MemberStatus.Late, enrollmentIds: ['enr-2-c1', 'enr-2-c5', 'enr-2-c6', 'enr-2-c2'], trailIds: ['t1', 't2'], eventIds: ['e2', 'e5', 'e4'], channelIds: ['ch1', 'ch3'], pulseIds: ['p1', 'p5', 'p6', 'p9'], lastAccess: daysAgo(12) },
  { id: '13', name: 'Fernando Rocha', jobTitle: 'Analista de Vendas', avatarUrl: 'https://i.pravatar.cc/40?u=13', overallProgress: 10, coursesCompleted: 0, totalCourses: 2, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.Late, enrollmentIds: ['enr-13-c6', 'enr-13-c3'], trailIds: ['t1'], eventIds: [], channelIds: ['ch1'], pulseIds: [], lastAccess: daysAgo(25) },

  // --- Cenário 2: ATENÇÃO (Obrigatório Vencendo ou Inatividade Leve) ---
  { id: '3', name: 'Maria Souza', jobTitle: 'Analista de Marketing', avatarUrl: 'https://i.pravatar.cc/40?u=3', overallProgress: 70, coursesCompleted: 1, totalCourses: 2, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.OnTrack, enrollmentIds: ['enr-3-c1', 'enr-3-c2', 'enr-3-c3'], trailIds: ['t3'], eventIds: ['e1', 'e6', 'e4'], channelIds: ['ch2'], pulseIds: ['p3', 'p7'], lastAccess: daysAgo(8) },
  { id: '11', name: 'Gabriela Ferreira', jobTitle: 'Vendedora Pleno', avatarUrl: 'https://i.pravatar.cc/40?u=11', overallProgress: 80, coursesCompleted: 3, totalCourses: 4, trailsCompleted: 2, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-11-c1','enr-11-c2','enr-11-c5'], trailIds: ['t1', 't2'], eventIds: ['e1','e2', 'e5', 'e4'], channelIds: ['ch1'], pulseIds: ['p1','p2'], lastAccess: daysAgo(4) },
  { id: '7', name: 'Juliana Costa', jobTitle: 'Vendedora Pleno', avatarUrl: 'https://i.pravatar.cc/40?u=7', overallProgress: 40, coursesCompleted: 1, totalCourses: 3, trailsCompleted: 1, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-7-c1', 'enr-7-c5', 'enr-7-c7'], trailIds: ['t1', 't2'], eventIds: ['e5'], channelIds: ['ch1'], pulseIds: ['p1', 'p2'], lastAccess: daysAgo(18) },
  { id: '12', name: 'Lucas Martins', jobTitle: 'Gerente de Contas Jr', avatarUrl: 'https://i.pravatar.cc/40?u=12', overallProgress: 55, coursesCompleted: 2, totalCourses: 4, trailsCompleted: 1, totalTrails: 1, status: MemberStatus.OnTrack, enrollmentIds: ['enr-12-c1','enr-12-c3'], trailIds: ['t4'], eventIds: ['e3', 'e6'], channelIds: ['ch1', 'ch2'], pulseIds: ['p1','p3','p8'], lastAccess: daysAgo(22) },

  // --- Cenário 3: EM DIA (Saudável) ---
  { id: '5', name: 'Beatriz Lima', jobTitle: 'Coordenadora de Vendas', avatarUrl: 'https://i.pravatar.cc/40?u=5', overallProgress: 100, coursesCompleted: 5, totalCourses: 5, trailsCompleted: 4, totalTrails: 4, status: MemberStatus.Completed, enrollmentIds: ['enr-5-c1', 'enr-5-c2', 'enr-5-c3', 'enr-5-c4', 'enr-5-c5'], trailIds: ['t1', 't2', 't3', 't4'], eventIds: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'], channelIds: ['ch1', 'ch2', 'ch3'], pulseIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11'], lastAccess: daysAgo(1) },
  { id: '9', name: 'Camila Alves', jobTitle: 'Especialista de Produto', avatarUrl: 'https://i.pravatar.cc/40?u=9', overallProgress: 92, coursesCompleted: 4, totalCourses: 5, trailsCompleted: 2, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-9-c1', 'enr-9-c2', 'enr-9-c3', 'enr-9-c5'], trailIds: ['t2', 't3'], eventIds: ['e1','e3', 'e6'], channelIds: ['ch2','ch3'], pulseIds: ['p3','p4','p5','p7','p9'], lastAccess: daysAgo(2) },
  { id: '10', name: 'Ricardo Pereira', jobTitle: 'Gerente de Contas', avatarUrl: 'https://i.pravatar.cc/40?u=10', overallProgress: 75, coursesCompleted: 2, totalCourses: 3, trailsCompleted: 1, totalTrails: 2, status: MemberStatus.OnTrack, enrollmentIds: ['enr-10-c1','enr-10-c5'], trailIds: ['t1','t2'], eventIds: ['e2', 'e4'], channelIds: ['ch1','ch3'], pulseIds: ['p1','p2','p5'], lastAccess: daysAgo(10) },
  { id: '6', name: 'Carlos Dias', jobTitle: 'Gerente de Contas Sênior', avatarUrl: 'https://i.pravatar.cc/40?u=6', overallProgress: 60, coursesCompleted: 1, totalCourses: 2, trailsCompleted: 1, totalTrails: 1, status: MemberStatus.OnTrack, enrollmentIds: ['enr-6-c3', 'enr-6-c5'], trailIds: ['t2'], eventIds: ['e3', 'e6'], channelIds: ['ch3'], pulseIds: ['p5'], lastAccess: daysAgo(14) },
  { id: '4', name: 'Pedro Henrique', jobTitle: 'Vendedor Júnior', avatarUrl: 'https://i.pravatar.cc/40?u=4', overallProgress: 20, coursesCompleted: 0, totalCourses: 2, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.OnTrack, enrollmentIds: ['enr-4-c1', 'enr-4-c4', 'enr-4-c2'], trailIds: ['t4'], eventIds: ['e1', 'e4'], channelIds: [], pulseIds: [], lastAccess: daysAgo(28) },
  
  // --- Cenário 4: INATIVO (Acesso > 30 dias) ---
  { id: '8', name: 'Rafael Martins', jobTitle: 'Estagiário de Marketing', avatarUrl: 'https://i.pravatar.cc/40?u=8', overallProgress: 15, coursesCompleted: 0, totalCourses: 3, trailsCompleted: 0, totalTrails: 1, status: MemberStatus.NotStarted, enrollmentIds: ['enr-8-c3', 'enr-8-c7'], trailIds: ['t3'], eventIds: ['e1', 'e4'], channelIds: ['ch2'], pulseIds: [], lastAccess: daysAgo(35) },
  { id: '14', name: 'Renata Gonçalves', jobTitle: 'Assistente de Vendas', avatarUrl: 'https://i.pravatar.cc/40?u=14', overallProgress: 5, coursesCompleted: 0, totalCourses: 1, trailsCompleted: 0, totalTrails: 0, status: MemberStatus.NotStarted, enrollmentIds: ['enr-14-c1', 'enr-14-c4'], trailIds: [], eventIds: [], channelIds: [], pulseIds: [], lastAccess: daysAgo(50) },
  { id: '1', name: 'Ana Clara', jobTitle: 'Analista de RH', avatarUrl: 'https://i.pravatar.cc/40?u=1', overallProgress: 0, coursesCompleted: 0, totalCourses: 0, trailsCompleted: 0, totalTrails: 0, status: MemberStatus.Empty, enrollmentIds: [], trailIds: [], eventIds: ['e2'], channelIds: [], pulseIds: [], lastAccess: daysAgo(90) },
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


export const TEAM_RANKING_DATA: TeamRankingItem[] = [
    { id: 'team1', rank: 1, name: 'Vendas', points: 12500, trend: 'up' },
    { id: 'team2', rank: 2, name: 'Marketing', points: 11800, trend: 'neutral' },
    { id: 'team3', rank: 3, name: 'Suporte', points: 10500, trend: 'down' },
    { id: 'team4', rank: 4, name: 'Desenvolvimento', points: 9800, trend: 'up' },
];

export const MEMBER_RANKING_DATA: MemberRankingItem[] = [
    { id: '5', rank: 1, name: 'Beatriz Lima', avatarUrl: 'https://i.pravatar.cc/40?u=5', jobTitle: 'Coordenadora de Vendas', points: 2100, trend: 'up'},
    { id: '9', rank: 2, name: 'Camila Alves', avatarUrl: 'https://i.pravatar.cc/40?u=9', jobTitle: 'Especialista de Produto', points: 1980, trend: 'up' },
    { id: '11', rank: 3, name: 'Gabriela Ferreira', avatarUrl: 'https://i.pravatar.cc/40?u=11', jobTitle: 'Vendedora Pleno', points: 1850, trend: 'neutral' },
    { id: '10', rank: 4, name: 'Ricardo Pereira', avatarUrl: 'https://i.pravatar.cc/40?u=10', jobTitle: 'Gerente de Contas', points: 1700, trend: 'up' },
    { id: '3', rank: 5, name: 'Maria Souza', avatarUrl: 'https://i.pravatar.cc/40?u=3', jobTitle: 'Analista de Marketing', points: 1600, trend: 'down'},
];

export const COURSE_STRUCTURE_DATA: CourseStructure[] = [
    {
        courseId: 'c1', // Mastering Digital Skills: A Comprehensive Guide
        chapters: [
            {
                id: 'c1ch1',
                title: 'Capítulo 1: Fundamentos da Produtividade Digital',
                durationMinutes: 60,
                quiz: [
                    { id: 'q1', question: 'Qual ferramenta é melhor para gestão de tarefas?', options: ['Email', 'Trello', 'Word'], correctAnswer: 'Trello' },
                    { id: 'q2', question: 'O que significa "Inbox Zero"?', options: ['Caixa de entrada vazia', 'Ignorar emails', 'Arquivar tudo'], correctAnswer: 'Caixa de entrada vazia' }
                ]
            },
            { id: 'c1ch2', title: 'Capítulo 2: Comunicação Efetiva Online', durationMinutes: 90 },
            { id: 'c1ch3', title: 'Capítulo 3: Segurança da Informação para o dia a dia', durationMinutes: 60 },
            { id: 'c1ch4', title: 'Capítulo 4: Colaboração em Nuvem', durationMinutes: 60 },
        ]
    },
    {
        courseId: 'c2', // Leadership Excellence: Unleashing Your Full Potential
        chapters: [
            { id: 'c2ch1', title: 'Módulo 1: Estilos de Liderança', durationMinutes: 120 },
            { id: 'c2ch2', title: 'Módulo 2: Feedback Construtivo', durationMinutes: 120, quiz: [
                {id: 'q3', question: 'Qual a melhor abordagem para feedback?', options: ['Sanduíche', 'Direta e honesta', 'Apenas positiva'], correctAnswer: 'Direta e honesta'}
            ]},
            { id: 'c2ch3', title: 'Módulo 3: Gestão de Conflitos', durationMinutes: 120 },
            { id: 'c2ch4', title: 'Módulo 4: Tomada de Decisão Estratégica', durationMinutes: 120 },
        ]
    }
];

export const MEMBER_COURSE_PROGRESS_DATA: MemberCourseProgress[] = [
    {
        memberId: '2', // João Silva
        courseId: 'c1',
        chapterStatus: {
            'c1ch1': {
                status: 'Concluído',
                timeSpentMinutes: 75,
                quizAnswers: [
                    { questionId: 'q1', answer: 'Trello' },
                    { questionId: 'q2', answer: 'Ignorar emails' } // Wrong answer
                ]
            },
            'c1ch2': {
                status: 'Concluído',
                timeSpentMinutes: 90,
            },
            'c1ch3': {
                status: 'Em Andamento',
                timeSpentMinutes: 25,
            },
            'c1ch4': {
                status: 'Não Iniciado',
                timeSpentMinutes: 0,
            }
        }
    },
    {
        memberId: '2', // João Silva
        courseId: 'c2',
        chapterStatus: {
            'c2ch1': { status: 'Concluído', timeSpentMinutes: 120 },
            'c2ch2': { status: 'Em Andamento', timeSpentMinutes: 40, quizAnswers: [{questionId: 'q3', answer: 'Direta e honesta'}] },
            'c2ch3': { status: 'Não Iniciado', timeSpentMinutes: 0 },
            'c2ch4': { status: 'Não Iniciado', timeSpentMinutes: 0 },
        }
    },
     {
        memberId: '3', // Maria Souza
        courseId: 'c1',
        chapterStatus: {
            'c1ch1': {
                status: 'Concluído',
                timeSpentMinutes: 65,
                quizAnswers: [
                    { questionId: 'q1', answer: 'Trello' },
                    { questionId: 'q2', answer: 'Caixa de entrada vazia' }
                ]
            },
            'c1ch2': {
                status: 'Concluído',
                timeSpentMinutes: 95,
            },
            'c1ch3': {
                status: 'Concluído',
                timeSpentMinutes: 60,
            },
            'c1ch4': {
                status: 'Concluído',
                timeSpentMinutes: 60,
            }
        }
    }
];

export const COURSE_CONTENT_ITEMS_DATA: CourseContentItem[] = [
    { id: 'cc1', courseId: 'c1', name: 'Boas-vindas ao Curso.mp4', type: ContentItemType.Video, durationSeconds: 120 },
    { id: 'cc2', courseId: 'c1', name: 'Apresentação da TIVIT.pdf', type: ContentItemType.PDF, durationSeconds: 300 },
    { id: 'cc3', courseId: 'c1', name: 'TIVIT LOGO VERMELHO.png', type: ContentItemType.Image, durationSeconds: 10 },
    { id: 'cc4', courseId: 'c1', name: 'Quiz de Conhecimento Inicial', type: ContentItemType.Quiz, durationSeconds: 180 },
    { id: 'cc5', courseId: 'c2', name: 'O que é um Líder.mp4', type: ContentItemType.Video, durationSeconds: 240 },
    { id: 'cc6', courseId: 'c2', name: 'Estudo de Caso: Liderança.pdf', type: ContentItemType.PDF, durationSeconds: 600 },
];

export const MEMBER_CONTENT_PROGRESS_DATA: MemberContentProgress[] = [
    // João Silva (id: 2) on Course c1
    { memberId: '2', contentId: 'cc1', firstAccess: daysAgo(12), lastAccess: daysAgo(11), timeSpentSeconds: 120, status: ConsumptionStatus.Finalizado, points: 5, performance: 100 },
    { memberId: '2', contentId: 'cc2', firstAccess: daysAgo(10), lastAccess: daysAgo(9), timeSpentSeconds: 180, status: ConsumptionStatus.EmAndamento, points: 2, performance: 60 },
    { memberId: '2', contentId: 'cc3', firstAccess: daysAgo(8), lastAccess: daysAgo(8), timeSpentSeconds: 5, status: ConsumptionStatus.Finalizado, points: 1, performance: 94 },
    // Maria Souza (id: 3) on Course c1
    { memberId: '3', contentId: 'cc1', firstAccess: daysAgo(5), lastAccess: daysAgo(5), timeSpentSeconds: 120, status: ConsumptionStatus.Finalizado, points: 5, performance: 100 },
    { memberId: '3', contentId: 'cc2', firstAccess: daysAgo(4), lastAccess: daysAgo(4), timeSpentSeconds: 300, status: ConsumptionStatus.Finalizado, points: 10, performance: 100 },
    { memberId: '3', contentId: 'cc3', firstAccess: daysAgo(3), lastAccess: daysAgo(3), timeSpentSeconds: 10, status: ConsumptionStatus.Finalizado, points: 1, performance: 100 },
    { memberId: '3', contentId: 'cc4', firstAccess: daysAgo(2), lastAccess: daysAgo(2), timeSpentSeconds: 180, status: ConsumptionStatus.Finalizado, points: 15, performance: 90 },
];