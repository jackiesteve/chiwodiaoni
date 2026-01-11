
import React from 'react';
import { Team, Player } from '../types';

interface Props {
  teams: Team[];
}

const PlayerStats: React.FC<Props> = ({ teams }) => {
  const allPlayers = teams.flatMap(t => t.players.map(p => ({ ...p, teamName: t.name, teamLogo: t.logo })));
  
  const topScorers = [...allPlayers].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssists = [...allPlayers].sort((a, b) => b.assists - a.assists).slice(0, 5);

  const StatList = ({ title, data, field, unit }: { title: string, data: any[], field: string, unit: string }) => (
    <div className="glass-panel rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        {title === '最佳射手' ? '🔥' : '🎯'} {title}
      </h3>
      <div className="space-y-4">
        {data.map((player, idx) => (
          <div key={player.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
              <img src={player.teamLogo} alt="" className="w-8 h-8 rounded-full" />
              <div>
                <div className="text-sm font-bold text-slate-800">{player.name}</div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{player.teamName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-emerald-600">{player[field]}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{unit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <StatList title="最佳射手" data={topScorers} field="goals" unit="进球" />
      <StatList title="助攻榜" data={topAssists} field="assists" unit="助攻" />
    </div>
  );
};

export default PlayerStats;
