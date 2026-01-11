
import { Team, Match } from './types';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 't1',
    name: '数学之神',
    shortName: 'MATH',
    logo: 'https://picsum.photos/id/1/100/100',
    players: [
      { id: 'p1', name: '欧拉', position: 'FW', number: 10, goals: 8, assists: 3, nationality: 'CHN' },
      { id: 'p2', name: '高斯', position: 'MF', number: 7, goals: 4, assists: 6, nationality: 'CHN' },
    ],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't2',
    name: '历社FC',
    shortName: 'HIST',
    logo: 'https://picsum.photos/id/2/100/100',
    players: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't3',
    name: '蛋仔派对',
    shortName: 'EGG',
    logo: 'https://picsum.photos/id/3/100/100',
    players: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't4',
    name: '胖男孩与小男孩',
    shortName: 'BOYS',
    logo: 'https://picsum.photos/id/4/100/100',
    players: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't5',
    name: '历马',
    shortName: 'LIMA',
    logo: 'https://picsum.photos/id/5/100/100',
    players: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't6',
    name: '基因编码组FC',
    shortName: 'GENE',
    logo: 'https://picsum.photos/id/6/100/100',
    players: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  }
];

export const INITIAL_MATCHES: Match[] = [];
