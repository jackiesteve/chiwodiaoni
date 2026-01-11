
export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  number: number;
  goals: number; // 初始/基础进球数
  assists: number; // 初始/基础助攻数
  nationality: string;
}

export interface GoalEvent {
  scorerName: string;
  assistantName?: string;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  players: Player[];
  stats: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    points: number;
  };
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  penaltyShootout?: {
    homePenaltyScore: number;
    awayPenaltyScore: number;
  };
  status: 'SCHEDULED' | 'FINISHED';
  date: string;
  venue: string;
  scorers: GoalEvent[];
  stage: 'GROUP' | 'KNOCKOUT';
  knockoutType?: 'SEMIFINAL' | 'FINAL' | 'THIRD_PLACE';
}

export type ViewType = 'STANDINGS' | 'TEAMS' | 'STATS' | 'MATCHES';
