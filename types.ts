

export enum MemberStatus {
  OnTrack = 'Em dia',
  Late = 'Atrasado',
  Completed = 'Concluído',
  NotStarted = 'Não Iniciado',
  Empty = 'Vazio'
}

export enum CourseStatus {
  Active = 'Ativo',
  Inactive = 'Inativo',
}

export enum PlanStatus {
    InProgress = 'Em Andamento',
    Completed = 'Concluído',
    Archived = 'Arquivado',
}

export enum EventType {
    Online = 'Online',
    Presencial = 'Presencial',
}

export enum PulseType {
    Video = 'Vídeo',
    Podcast = 'Podcast',
    Imagem = 'Imagem',
    PDF = 'PDF',
    Word = 'Word',
    PowerPoint = 'PowerPoint',
    Excel = 'Excel',
    YouTube = 'YouTube',
    Vimeo = 'Vimeo',
    Link = 'Link',
    SoundCloud = 'SoundCloud',
    GoogleDrive = 'Google Drive',
    Quiz = 'Quiz',
    Genially = 'Genially',
    H5P = 'H5P',
}

export enum ContentItemType {
  Image = 'Imagem',
  Video = 'Vídeo',
  PDF = 'PDF',
  Quiz = 'Quiz',
  Link = 'Link',
}

export enum ConsumptionStatus {
  Finalizado = 'Finalizada',
  EmAndamento = 'Em Andamento',
  NaoIniciado = 'Não Iniciado',
}

export enum EnrollmentStatus {
    Matriculado = 'Matriculado',
    Iniciada = 'Iniciada',
    Expirada = 'Expirada',
    ReqNovoPrazo = 'Req. Novo Prazo',
    Finalizado = 'Finalizado',
    AgAprovacao = 'Ag. Aprovação',
    Reprovada = 'Reprovada',
    Desistiu = 'Desistiu',
    Inativa = 'Inativa',
}

export enum EnrollmentType {
    Livre = 'Livre',
    Obrigatoria = 'Obrigatória',
}

export interface Enrollment {
    id: string;
    memberId: string;
    courseId: string;
    type: EnrollmentType;
    isNormativa: boolean;
    dueDate?: string;
    progress: number;
    status: EnrollmentStatus;
    renewalDate?: string;
}

export type GeneralStatus = MemberStatus | CourseStatus | PlanStatus | EnrollmentStatus;

export type TrendDirection = 'positive' | 'negative' | 'neutral';

export interface KpiData {
  value: string;
  label: string;
}

export interface EnhancedKpiData extends KpiData {
  context: string;
  supportText?: string;
  trend: {
    value: string;
    direction: TrendDirection;
    period: string;
    benchmarkValue?: string;
  };
}

export type ActionReason = string;

export interface ImmediateActionItem {
    memberId: string;
    reason: ActionReason;
    criticalDetail: string;
}

export interface TeamMember {
  id: string;
  name: string;
  jobTitle: string;
  avatarUrl: string;
  managerId?: string;
  overallProgress: number;
  coursesCompleted: number;
  totalCourses: number;
  trailsCompleted: number;
  totalTrails: number;
  status: MemberStatus;
  enrollmentIds: string[];
  trailIds: string[];
  eventIds: string[];
  channelIds: string[];
  pulseIds: string[];
  lastAccess: string;
}

export type View = 'visaoGeral' | 'liderados' | 'cursos' | 'trilhas' | 'eventos' | 'canais' | 'pulses';

export type SelectedItem =
  | { type: 'member'; data: TeamMember }
  | { type: 'course'; data: Course }
  | { type: 'trail'; data: Trail }
  | { type: 'event'; data: Event }
  | { type: 'channel'; data: Channel }
  | { type: 'pulse'; data: Pulse }
  | null;


export interface SortConfig {
  key: keyof TeamMember | keyof Course | keyof Trail | keyof Event | keyof Channel | keyof Pulse;
  direction: 'ascending' | 'descending';
}

export interface Course {
    id: string;
    name: string;
    duration: string;
    students: number;
    status: CourseStatus;
    skills?: string[];
    isExternal?: boolean;
    // FIX: Added missing optional properties to Course type
    dueDate?: string;
    isMandatory?: boolean;
    isNormativa?: boolean;
}

export interface Pulse {
    id: string;
    name: string;
    channelId: string;
    type: PulseType;
    duration: string;
    skills?: string[];
}

export interface Channel {
    id: string;
    name: string;
    description: string;
    subscribers: number;
    pulsesCount: number;
    pulseIds: string[];
}

export interface Trail {
    id: string;
    name: string;
    coursesCount: number;
    students: number;
    courseIds: string[];
    pulseIds: string[];
    skills?: string[];
    isMandatory?: boolean;
    dueDate?: string;
}

export interface Event {
    id: string;
    name: string;
    date: string;
    type: EventType;
    participants: number;
}

export type PerformanceTimeframe = 'daily' | 'weekly' | 'monthly';

export interface KpiMetrics {
    completionRate: number;
    engagement: number;
    pendingTasks: number;
}

export interface PerformanceDataPoint {
  name: string; 
  currentPeriod: KpiMetrics;
  previousPeriod: KpiMetrics;
}

export type Theme = 'light' | 'dark';

export type RankingTrend = 'up' | 'down' | 'neutral';

export interface TeamRankingItem {
    id: string;
    rank: number;
    name: string;
    points: number;
    trend: RankingTrend;
}

export interface MemberRankingItem {
    id: string;
    rank: number;
    name: string;
    avatarUrl: string;
    jobTitle: string;
    points: number;
    trend: RankingTrend;
}

export interface ContentRef {
    id: string;
    type: 'course' | 'trail' | 'pulse' | 'event' | 'channel';
}

export interface Recommendation {
    id: string;
    title: string;
    memberIds: string[];
    viewedByMemberIds: string[];
    content: ContentRef[];
    status: PlanStatus;
    dueDate?: string;
}

export interface DevelopmentPlan {
    id: string;
    title: string;
    memberIds: string[];
    viewedByMemberIds: string[];
    content: ContentRef[];
    status: PlanStatus;
    dueDate?: string;
}

// Detailed course progress types
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface CourseChapter {
    id: string;
    title: string;
    durationMinutes: number;
    quiz?: QuizQuestion[];
}

export interface CourseStructure {
    courseId: string;
    chapters: CourseChapter[];
}

export interface QuizAnswer {
    questionId: string;
    answer: string;
}

export interface MemberCourseProgress {
    memberId: string;
    courseId: string;
    chapterStatus: {
        [chapterId: string]: {
            status: 'Concluído' | 'Em Andamento' | 'Não Iniciado';
            timeSpentMinutes: number;
            quizAnswers?: QuizAnswer[];
        }
    };
}

// Granular course content types
export interface CourseContentItem {
  id: string;
  courseId: string;
  name: string;
  type: ContentItemType;
  durationSeconds: number;
}

export interface MemberContentProgress {
  memberId: string;
  contentId: string;
  firstAccess: string; // ISO Date String
  lastAccess: string; // ISO Date String
  timeSpentSeconds: number;
  status: ConsumptionStatus;
  points: number;
  performance: number; // as percentage
}

// FIX: Added missing ExpiringCourseItem type
export interface ExpiringCourseItem {
  memberId: string;
  courseId: string;
  dueDate: string;
}