// Enums
export enum Lineage {
  THE_INTIMATE = 'the_intimate',
  THE_PHILOSOPHICAL = 'the_philosophical',
  THE_REVELATORY = 'the_revelatory',
}

export enum Register {
  CASUAL = 'casual',
  DEEP = 'deep',
}

export enum Domain {
  MEMORY = 'memory',
  IDENTITY = 'identity',
  DESIRE = 'desire',
}

export enum Archetype {
  THE_CONFESSOR = 'the_confessor',
  THE_OBSERVER = 'the_observer',
  THE_INSTIGATOR = 'the_instigator',
}

export enum BoardFormat {
  CLASSIC = 'classic',
  MODERN = 'modern',
}

export enum BoardLayout {
  GRID = 'grid',
  LIST = 'list',
}

export enum Status {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

// Interfaces
export interface QuestionItem {
  id: string;
  text: string;
  lineage: Lineage;
  register: Register;
  domain: Domain;
}

export interface ChainEntry {
  id: string;
  questionId: string;
  playerId: string;
  answerText: string;
  timestamp: string;
}

export interface ReturnEntry {
  id: string;
  originalAnswerId: string;
  playerId: string;
  reflectionText: string;
}

export interface ContributionItem {
  id: string;
  playerId: string;
  archetype: Archetype;
  itemData: any;
}

export interface ConfessionAlbumConfig {
  id: string;
  format: BoardFormat;
  layout: BoardLayout;
  questionIds: string[];
  status: Status;
}

export interface PlayerOrder {
  id: string;
  playerIds: string[];
}

export interface ContentQuestion {
  id: string;
  text: string;
  metadata: any;
}

export interface AlbumTemplateData {
  config: ConfessionAlbumConfig;
  entries: ChainEntry[];
}

export interface ProustsAnswerTemplateData {
  proustId: string;
  summaryText: string;
}
