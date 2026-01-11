
import React from 'react';
import { Team, Match } from '../types';

interface Props {
  teams: Team[];
  matches: Match[];
  onDeleteMatch?: (matchId: string) => void;
}

const StandingsTable: React.FC<Props> = ({ teams, matches, onDeleteMatch }) => {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    const gdA = a.stats.gf - a.stats.ga;
    const gdB = b.stats.gf - b.stats.ga;
    return gdB - gdA;
  });

  // 获取前4名球队，进入淘汰赛
  const top4Teams = sortedTeams.slice(0, 4);

  // 获取淘汰赛比赛结果
  const knockoutMatches = matches.filter(m => m.stage === 'KNOCKOUT' && m.status === 'FINISHED');
  
  // 分类淘汰赛比赛
  const semifinalMatches = knockoutMatches.filter(m => m.knockoutType === 'SEMIFINAL');
  const finalMatch = knockoutMatches.find(m => m.knockoutType === 'FINAL');
  const thirdPlaceMatch = knockoutMatches.find(m => m.knockoutType === 'THIRD_PLACE');

  // 获取比赛结果
  const getMatchWinner = (match: Match) => {
    if (match.homeScore > match.awayScore) return match.homeTeamId;
    if (match.awayScore > match.homeScore) return match.awayTeamId;
    // 平局时根据点球大战结果
    if (match.penaltyShootout) {
      if (match.penaltyShootout.homePenaltyScore > match.penaltyShootout.awayPenaltyScore) return match.homeTeamId;
      if (match.penaltyShootout.awayPenaltyScore > match.penaltyShootout.homePenaltyScore) return match.awayTeamId;
    }
    return null; // 平局（无点球大战）
  };

  // 获取球队名称
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || '未知球队';
  };

  // 获取球队logo
  const getTeamLogo = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.logo || 'https://via.placeholder.com/100';
  };

  // 生成半决赛对阵
  const generateSemifinalMatchups = () => {
    if (top4Teams.length < 4) return [];
    
    // 检查是否已有半决赛比赛
    if (semifinalMatches.length > 0) return semifinalMatches;
    
    // 生成默认的半决赛对阵
    return [
      {
        id: 'semifinal-1',
        homeTeamId: top4Teams[0].id,
        awayTeamId: top4Teams[3].id,
        homeScore: 0,
        awayScore: 0,
        status: 'SCHEDULED' as const,
        date: new Date().toISOString(),
        venue: '重庆师范大学',
        scorers: [],
        stage: 'KNOCKOUT' as const,
        knockoutType: 'SEMIFINAL' as const
      },
      {
        id: 'semifinal-2',
        homeTeamId: top4Teams[1].id,
        awayTeamId: top4Teams[2].id,
        homeScore: 0,
        awayScore: 0,
        status: 'SCHEDULED' as const,
        date: new Date().toISOString(),
        venue: '重庆师范大学',
        scorers: [],
        stage: 'KNOCKOUT' as const,
        knockoutType: 'SEMIFINAL' as const
      }
    ];
  };

  // 计算决赛和季军赛队伍
  const getFinalTeams = () => {
    if (semifinalMatches.length < 2) return { finalTeams: [null, null], thirdPlaceTeams: [null, null] };
    
    const semifinal1Winner = getMatchWinner(semifinalMatches[0]);
    const semifinal1Loser = semifinalMatches[0].homeTeamId === semifinal1Winner ? semifinalMatches[0].awayTeamId : semifinalMatches[0].homeTeamId;
    
    const semifinal2Winner = getMatchWinner(semifinalMatches[1]);
    const semifinal2Loser = semifinalMatches[1].homeTeamId === semifinal2Winner ? semifinalMatches[1].awayTeamId : semifinalMatches[1].homeTeamId;
    
    return {
      finalTeams: [semifinal1Winner, semifinal2Winner],
      thirdPlaceTeams: [semifinal1Loser, semifinal2Loser]
    };
  };

  const { finalTeams, thirdPlaceTeams } = getFinalTeams();
  const semifinalMatchups = generateSemifinalMatchups();

  return (
    <div className="space-y-8">
      {/* 联赛积分榜 */}
      <div className="glass-panel rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">联赛积分榜</h2>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">实时更新</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">排名</th>
                <th className="px-6 py-4">球队</th>
                <th className="px-6 py-4">场次</th>
                <th className="px-6 py-4">胜</th>
                <th className="px-6 py-4">平</th>
                <th className="px-6 py-4">负</th>
                <th className="px-6 py-4">净胜球</th>
                <th className="px-6 py-4 text-right">积分</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTeams.map((team, idx) => (
                <tr key={team.id} className={`hover:bg-slate-50/50 transition-colors ${idx < 4 ? 'bg-emerald-50/30' : ''}`}>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {idx + 1}
                    {idx < 4 && <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">晋级</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full bg-slate-100 object-cover" />
                      <div>
                        <div className="text-sm font-bold text-slate-800">{team.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{team.shortName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{team.stats.played}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{team.stats.won}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{team.stats.drawn}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{team.stats.lost}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className={team.stats.gf - team.stats.ga >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                      {team.stats.gf - team.stats.ga > 0 ? '+' : ''}{team.stats.gf - team.stats.ga}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">{team.stats.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 淘汰赛阶段 */}
      <div className="glass-panel rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">联赛第二阶段 - 淘汰赛</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">4强赛</span>
        </div>
        <div className="p-6">
          {top4Teams.length < 4 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              球队数量不足，需要至少4支球队才能进行淘汰赛。
            </div>
          ) : (
            <div className="space-y-8">
              {/* 半决赛 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700">半决赛</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semifinalMatchups.map((match, index) => {
                    const isRealMatch = matches.some(m => m.id === match.id);
                    const realMatch = isRealMatch ? matches.find(m => m.id === match.id) : null;
                    const displayMatch = realMatch || match;
                    
                    return (
                      <div key={displayMatch.id} className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center">
                        <div className="text-sm font-bold text-slate-500 mb-2">
                          {index === 0 ? '第1名 vs 第4名' : '第2名 vs 第3名'}
                        </div>
                        <div className="flex items-center justify-center gap-8 w-full">
                          <div className="text-center">
                            <img src={getTeamLogo(displayMatch.homeTeamId)} alt={getTeamName(displayMatch.homeTeamId)} className="w-16 h-16 rounded-full mb-2 object-cover" />
                            <div className="font-bold text-slate-800">{getTeamName(displayMatch.homeTeamId)}</div>
                            {index === 0 && <div className="text-xs text-slate-400">#1</div>}
                            {index === 1 && <div className="text-xs text-slate-400">#2</div>}
                          </div>
                          <div className="text-2xl font-bold text-slate-200">VS</div>
                          <div className="text-center">
                            <img src={getTeamLogo(displayMatch.awayTeamId)} alt={getTeamName(displayMatch.awayTeamId)} className="w-16 h-16 rounded-full mb-2 object-cover" />
                            <div className="font-bold text-slate-800">{getTeamName(displayMatch.awayTeamId)}</div>
                            {index === 0 && <div className="text-xs text-slate-400">#4</div>}
                            {index === 1 && <div className="text-xs text-slate-400">#3</div>}
                          </div>
                        </div>
                        {/* 显示半决赛结果 */}
                        {displayMatch.status === 'FINISHED' && (
                          <div className="mt-4 w-full">
                            <div className="w-full bg-slate-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold">{getTeamName(displayMatch.homeTeamId)}</span>
                                <span className="text-lg font-bold">{displayMatch.homeScore} - {displayMatch.awayScore}</span>
                                <span className="font-bold">{getTeamName(displayMatch.awayTeamId)}</span>
                              </div>
                              {/* 显示点球大战结果 */}
                              {displayMatch.penaltyShootout && (
                                <div className="flex justify-center items-center my-2 text-sm font-bold text-slate-600">
                                  <span>点球: {displayMatch.penaltyShootout.homePenaltyScore} - {displayMatch.penaltyShootout.awayPenaltyScore}</span>
                                </div>
                              )}
                              {getMatchWinner(displayMatch) && (
                                <div className="text-center text-sm font-bold text-emerald-600">
                                  胜者: {getTeamName(getMatchWinner(displayMatch)!)}
                                </div>
                              )}
                            </div>
                            {/* 删除按钮 */}
                            {isRealMatch && onDeleteMatch && (
                              <button 
                                onClick={() => onDeleteMatch(displayMatch.id)}
                                className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold hover:bg-red-200"
                              >
                                删除比赛
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 决赛和季军赛 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700">决赛 & 季军赛</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 季军赛 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center">
                    <div className="text-sm font-bold text-slate-500 mb-2">季军赛</div>
                    <div className="flex items-center justify-center gap-8 w-full">
                      <div className="text-center">
                        {thirdPlaceTeams[0] ? (
                          <>
                            <img src={getTeamLogo(thirdPlaceTeams[0])} alt={getTeamName(thirdPlaceTeams[0])} className="w-16 h-16 rounded-full mb-2 object-cover" />
                            <div className="font-bold text-slate-800">{getTeamName(thirdPlaceTeams[0])}</div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-full bg-slate-100 mb-2 flex items-center justify-center">
                              <span className="text-slate-400">待定</span>
                            </div>
                            <div className="font-bold text-slate-800">半决赛败者1</div>
                          </>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-slate-200">VS</div>
                      <div className="text-center">
                        {thirdPlaceTeams[1] ? (
                          <>
                            <img src={getTeamLogo(thirdPlaceTeams[1])} alt={getTeamName(thirdPlaceTeams[1])} className="w-16 h-16 rounded-full mb-2 object-cover" />
                            <div className="font-bold text-slate-800">{getTeamName(thirdPlaceTeams[1])}</div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-full bg-slate-100 mb-2 flex items-center justify-center">
                              <span className="text-slate-400">待定</span>
                            </div>
                            <div className="font-bold text-slate-800">半决赛败者2</div>
                          </>
                        )}
                      </div>
                    </div>
                    {/* 显示季军赛结果 */}
                    {thirdPlaceMatch && (
                      <div className="mt-4 w-full bg-slate-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold">{getTeamName(thirdPlaceMatch.homeTeamId)}</span>
                          <span className="text-lg font-bold">{thirdPlaceMatch.homeScore} - {thirdPlaceMatch.awayScore}</span>
                          <span className="font-bold">{getTeamName(thirdPlaceMatch.awayTeamId)}</span>
                        </div>
                        {/* 显示点球大战结果 */}
                        {thirdPlaceMatch.penaltyShootout && (
                          <div className="flex justify-center items-center my-2 text-sm font-bold text-slate-600">
                            <span>点球: {thirdPlaceMatch.penaltyShootout.homePenaltyScore} - {thirdPlaceMatch.penaltyShootout.awayPenaltyScore}</span>
                          </div>
                        )}
                        {getMatchWinner(thirdPlaceMatch) && (
                          <div className="text-center text-sm font-bold text-emerald-600">
                            季军: {getTeamName(getMatchWinner(thirdPlaceMatch)!)}
                          </div>
                        )}
                        {/* 删除按钮 */}
                        {onDeleteMatch && (
                          <button 
                            onClick={() => onDeleteMatch(thirdPlaceMatch.id)}
                            className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold hover:bg-red-200"
                          >
                            删除比赛
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {/* 决赛 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center">
                    <div className="text-sm font-bold text-slate-500 mb-2">决赛</div>
                    <div className="flex items-center justify-center gap-8 w-full">
                      <div className="text-center">
                        {finalTeams[0] ? (
                          <>
                            <img src={getTeamLogo(finalTeams[0])} alt={getTeamName(finalTeams[0])} className="w-16 h-16 rounded-full mb-2 object-cover" />
                            <div className="font-bold text-slate-800">{getTeamName(finalTeams[0])}</div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-full bg-slate-100 mb-2 flex items-center justify-center">
                              <span className="text-slate-400">待定</span>
                            </div>
                            <div className="font-bold text-slate-800">半决赛胜者1</div>
                          </>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-slate-200">VS</div>
                      <div className="text-center">
                        {finalTeams[1] ? (
                          <>
                            <img src={getTeamLogo(finalTeams[1])} alt={getTeamName(finalTeams[1])} className="w-16 h-16 rounded-full mb-2 object-cover" />
                            <div className="font-bold text-slate-800">{getTeamName(finalTeams[1])}</div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-full bg-slate-100 mb-2 flex items-center justify-center">
                              <span className="text-slate-400">待定</span>
                            </div>
                            <div className="font-bold text-slate-800">半决赛胜者2</div>
                          </>
                        )}
                      </div>
                    </div>
                    {/* 显示决赛结果 */}
                    {finalMatch && (
                      <div className="mt-4 w-full bg-slate-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold">{getTeamName(finalMatch.homeTeamId)}</span>
                          <span className="text-lg font-bold">{finalMatch.homeScore} - {finalMatch.awayScore}</span>
                          <span className="font-bold">{getTeamName(finalMatch.awayTeamId)}</span>
                        </div>
                        {/* 显示点球大战结果 */}
                        {finalMatch.penaltyShootout && (
                          <div className="flex justify-center items-center my-2 text-sm font-bold text-slate-600">
                            <span>点球: {finalMatch.penaltyShootout.homePenaltyScore} - {finalMatch.penaltyShootout.awayPenaltyScore}</span>
                          </div>
                        )}
                        {getMatchWinner(finalMatch) && (
                          <div className="text-center text-sm font-bold text-emerald-600">
                            冠军: {getTeamName(getMatchWinner(finalMatch)!)}
                          </div>
                        )}
                        {/* 删除按钮 */}
                        {onDeleteMatch && (
                          <button 
                            onClick={() => onDeleteMatch(finalMatch.id)}
                            className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold hover:bg-red-200"
                          >
                            删除比赛
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;
