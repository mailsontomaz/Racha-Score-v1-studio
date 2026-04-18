export type GameFormat = 
  | 'quem-perde-sai' 
  | 'todos-contra-todos' 
  | 'pontos-corridos' 
  | 'copa';

export interface Player {
  id: string;
  name: string;
  shirtNumber?: string;
  saved?: boolean;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
  goalkeeperId?: string;
  score: number;
  stats: {
    goals: number;
    assists: number;
    tacklesReal: number;
    tacklesFake: number;
    savesEasy: number;
    savesDifficult: number;
    frangos: number;
    yellowCards: number;
    redCards: number;
    ownGoals: number;
  };
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'assist' | 'tackleReal' | 'tackleFake' | 'saveEasy' | 'saveDifficult' | 'frango' | 'yellow' | 'red' | 'ownGoal';
  playerId: string;
  playerName: string;
  teamId: string;
  timestamp: number;
  gameTime?: string;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  score1: number;
  score2: number;
  status: 'pending' | 'live' | 'finished';
  startTime?: number;
  endTime?: number;
  events: MatchEvent[];
}

export interface RachaSession {
  id: string;
  name: string;
  organizer: string;
  date: string;
  playerCount: number; // Players per team
  format: GameFormat;
  players: Player[];
  teams: Team[];
  matches: Match[];
  status: 'setup' | 'live' | 'finished';
}
