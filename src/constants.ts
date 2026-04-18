export const RACHA_TEAMS = [
  {
    id: 'jumentus',
    name: 'Jumentus',
    nickname: 'FC · teimoso · amarelo',
    color: '#F4C430',
    ink: '#0A0E12',
    crest: 'JU'
  },
  {
    id: 'real-matismo',
    name: 'Real Matismo',
    nickname: 'CF · reclamão · merengue',
    color: '#E63946',
    ink: '#FFFFFF',
    crest: 'RM'
  },
  {
    id: 'horriver-plate',
    name: 'Horriver Plate',
    nickname: 'AC · banda · tricolor',
    color: '#1B4D8C',
    ink: '#FFFFFF',
    crest: 'HP'
  }
];

export const FORMATS = [
  { id: 'quem-perde-sai', label: 'Quem perde sai' },
  { id: 'todos-contra-todos', label: 'Todos contra todos' },
  { id: 'pontos-corridos', label: 'Pontos corridos' },
  { id: 'copa', label: 'Torneio estilo copa' }
];

export const SCORING_RULES = {
  goal: 1.00,
  assist: 1.00,
  tackleReal: 1.00,
  tackleFake: 0.50,
  saveEasy: 1.00,
  saveDifficult: 2.00,
  frango: -2.00,
  ownGoal: -1.00,
  yellow: -1.00,
  red: -3.00,
  win: 1.00,
  draw: 0.00, // Not explicitly in the point summary list for match points, usually just vitórias are +1
  cleanSheet: 2.50,
  attendance: 5.00,
  bestScorer: 5.00,
  bestAssister: 5.00,
  bestTackler: 2.50,
  firstPlace: 5.00,
  secondPlace: 2.50
};
