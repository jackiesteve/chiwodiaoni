
import React from 'react';
import { Match, Team } from '../types';

interface Props {
  matches: Match[];
  teams: Team[];
  onEditMatch: (match: Match) => void;
  onDeleteMatch?: (matchId: string) => void;
}

const MatchCenter: React.FC<Props> = ({ matches, teams, onEditMatch, onDeleteMatch }) => {
  const getTeam = (id: string) => teams.find(t => t.id === id);

  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid grid-cols-1 gap-6">
      {sortedMatches.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          暂无比赛赛程。请添加已完赛或预定的比赛。
        </div>
      ) : (
        sortedMatches.map(match => {
          const home = getTeam(match.homeTeamId);
          const away = getTeam(match.awayTeamId);
          
          return (
            <div key={match.id} className="glass-panel p-6 rounded-3xl shadow-sm border border-slate-100 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => onEditMatch(match)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1"
                >
                  ✏️ 编辑
                </button>
                {onDeleteMatch && (
                  <button 
                    onClick={() => onDeleteMatch(match.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                  >
                    🗑️ 删除
                  </button>
                )}
              </div>

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                  {match.stage === 'GROUP' ? '第一阶段' : '第二阶段'}
                </div>
                {match.stage === 'KNOCKOUT' && match.knockoutType && (
                  <div className="px-3 py-1 bg-blue-100 rounded-full text-xs font-bold text-blue-600">
                    {match.knockoutType === 'SEMIFINAL' ? '半决赛' : match.knockoutType === 'FINAL' ? '决赛' : '季军赛'}
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
                <div className="flex-1 flex items-center justify-end gap-6 w-full">
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-800">{home?.name || '未知球队'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">主场 / ID: {match.homeTeamId}</div>
                  </div>
                  <img src={home?.logo || 'https://via.placeholder.com/100'} alt="" className="w-16 h-16 rounded-full shadow-md bg-slate-50 object-cover border-2 border-white" />
                </div>

                <div className="flex flex-col items-center justify-center min-w-[140px]">
                  {match.status === 'FINISHED' ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl font-black text-slate-900">{match.homeScore}</span>
                        <span className="text-sm font-bold text-slate-300">完</span>
                        <span className="text-4xl font-black text-slate-900">{match.awayScore}</span>
                      </div>
                      {/* 显示点球大战结果 */}
                      {match.penaltyShootout && (
                        <div className="text-sm font-bold text-slate-600 mt-1">
                          点球: {match.penaltyShootout.homePenaltyScore} - {match.penaltyShootout.awayPenaltyScore}
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">战报已确认</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-1">未开始</span>
                      <span className="text-2xl font-black text-slate-200 tracking-widest">VS</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-1">
                    📅 {new Date(match.date).toLocaleString('zh-CN', { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-start gap-6 w-full">
                  <img src={away?.logo || 'https://via.placeholder.com/100'} alt="" className="w-16 h-16 rounded-full shadow-md bg-slate-50 object-cover border-2 border-white" />
                  <div className="text-left">
                    <div className="text-lg font-bold text-slate-800">{away?.name || '未知球队'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">客场 / ID: {match.awayTeamId}</div>
                  </div>
                </div>
              </div>

              {match.status === 'FINISHED' && (
                <div className="mt-4 pt-4 border-t border-slate-50 bg-slate-50/30 rounded-xl p-4">
                   <div className="grid grid-cols-2 gap-8 relative">
                      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-100 hidden md:block"></div>
                      
                      {/* 主队进球信息 */}
                      <div className="space-y-1 text-right">
                        {match.scorers.filter(s => s.teamId === match.homeTeamId).map((s, i) => (
                          <div key={i} className="text-xs text-slate-600">
                            <span className="font-bold text-slate-800">{s.scorerName}</span> 
                            {s.assistantName && <span className="text-[10px] text-slate-400 ml-1">助攻: {s.assistantName}</span>}
                            <span className="ml-1">⚽</span>
                          </div>
                        ))}
                      </div>

                      {/* 客队进球信息 */}
                      <div className="space-y-1 text-left">
                        {match.scorers.filter(s => s.teamId === match.awayTeamId).map((s, i) => (
                          <div key={i} className="text-xs text-slate-600">
                            <span className="mr-1">⚽</span>
                            <span className="font-bold text-slate-800">{s.scorerName}</span> 
                            {s.assistantName && <span className="text-[10px] text-slate-400 ml-1">助攻: {s.assistantName}</span>}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
                  📍 {match.venue || '重庆师范大学'}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MatchCenter;
