import { Lineage, Register, Domain } from '../types/confession-album';

export const BUNDLED_QUESTIONS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    text: 'What is your idea of perfect happiness?',
    metadata: {
      lineage: Lineage.THE_PHILOSOPHICAL,
      register: Register.DEEP,
      domain: Domain.DESIRE
    }
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    text: 'What is your greatest fear?',
    metadata: {
      lineage: Lineage.THE_PHILOSOPHICAL,
      register: Register.DEEP,
      domain: Domain.DESIRE
    }
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    text: 'What is the trait you most deplore in yourself?',
    metadata: {
      lineage: Lineage.THE_INTIMATE,
      register: Register.DEEP,
      domain: Domain.IDENTITY
    }
  }
];
