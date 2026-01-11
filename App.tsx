
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import StandingsTable from './components/StandingsTable';
import PlayerStats from './components/PlayerStats';
import MatchCenter from './components/MatchCenter';
import { INITIAL_TEAMS, INITIAL_MATCHES } from './mockData';
import { ViewType, Team, Player, Match, GoalEvent } from './types';

const App: React.FC = () => {
  // 从localStorage加载数据，如果没有则使用初始数据
  const loadFromLocalStorage = () => {
    const savedTeams = localStorage.getItem('teams');
    const savedMatches = localStorage.getItem('matches');
    return {
      teams: savedTeams ? JSON.parse(savedTeams) : INITIAL_TEAMS,
      matches: savedMatches ? JSON.parse(savedMatches) : INITIAL_MATCHES
    };
  };

  const [activeView, setActiveView] = useState<ViewType>('STANDINGS');
  const [teams, setTeams] = useState<Team[]>(loadFromLocalStorage().teams);
  const [matches, setMatches] = useState<Match[]>(loadFromLocalStorage().matches);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null); // 改为 ID 驱动

  // 表单状态
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState<Player | boolean>(false);
  const [showMatchForm, setShowMatchForm] = useState<Match | boolean>(false);

  // 当teams或matches数据变化时，自动保存到localStorage
  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('matches', JSON.stringify(matches));
  }, [teams, matches]);


  const [formData, setFormData] = useState({
    teamName: '', teamShort: '', teamLogo: '',
    playerName: '', playerNum: '', playerPos: 'MF', playerGoals: '0', playerAssists: '0',
    matchHomeId: '', matchAwayId: '', matchDate: '', matchTime: '',
    matchHomeScore: '0', matchAwayScore: '0', matchStatus: 'SCHEDULED' as 'SCHEDULED' | 'FINISHED',
    matchScorersText: '',
    matchStage: 'GROUP' as 'GROUP' | 'KNOCKOUT',
    matchKnockoutType: 'SEMIFINAL' as 'SEMIFINAL' | 'FINAL' | 'THIRD_PLACE' | undefined,
    matchHomePenaltyScore: '0', matchAwayPenaltyScore: '0'
  });


  // 核心逻辑：动态计算所有球员和球队的实时统计数据
  const teamsWithLiveStats = useMemo(() => {
    return teams.map(team => {
      const updatedPlayers = team.players.map(player => {
        let matchGoals = 0;
        let matchAssists = 0;

        matches.filter(m => m.status === 'FINISHED').forEach(m => {
          m.scorers.forEach(event => {
            if (event.teamId === team.id) {
              if (event.scorerName.trim() === player.name.trim()) matchGoals++;
              if (event.assistantName?.trim() === player.name.trim()) matchAssists++;
            }
          });
        });

        return {
          ...player,
          goals: player.goals + matchGoals,
          assists: player.assists + matchAssists
        };
      });

      const stats = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
      // 只计算小组赛的积分
      matches.filter(m => m.status === 'FINISHED' && m.stage === 'GROUP').forEach(m => {
        if (m.homeTeamId === team.id) {
          stats.played++;
          stats.gf += m.homeScore;
          stats.ga += m.awayScore;
          if (m.homeScore > m.awayScore) { stats.won++; stats.points += 3; }
          else if (m.homeScore === m.awayScore) { stats.drawn++; stats.points += 1; }
          else stats.lost++;
        } else if (m.awayTeamId === team.id) {
          stats.played++;
          stats.gf += m.awayScore;
          stats.ga += m.homeScore;
          if (m.awayScore > m.homeScore) { stats.won++; stats.points += 3; }
          else if (m.awayScore === m.homeScore) { stats.drawn++; stats.points += 1; }
          else stats.lost++;
        }
      });

      return { ...team, players: updatedPlayers, stats };
    });
  }, [teams, matches]);

  // 获取当前选中的球队对象
  const currentSelectedTeam = useMemo(() => 
    teamsWithLiveStats.find(t => t.id === selectedTeamId) || null
  , [selectedTeamId, teamsWithLiveStats]);

  const addTeam = () => {
    if (!formData.teamName) return;
    const newTeam: Team = {
      id: `t${Date.now()}`,
      name: formData.teamName,
      shortName: formData.teamShort || formData.teamName.substring(0, 3).toUpperCase(),
      logo: formData.teamLogo || `https://picsum.photos/id/${teams.length + 20}/100/100`,
      players: [],
      stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
    };
    setTeams([...teams, newTeam]);
    setShowTeamForm(false);
    setFormData({ ...formData, teamName: '', teamShort: '', teamLogo: '' });
  };

  const updateTeamLogo = () => {
    if (!selectedTeamId || !formData.teamLogo) return;
    setTeams(teams.map(t => t.id === selectedTeamId ? { ...t, logo: formData.teamLogo } : t));
    setIsEditingLogo(false);
    setFormData({ ...formData, teamLogo: '' });
  };

  const handlePlayerSubmit = () => {
    if (!selectedTeamId || !formData.playerName) return;
    
    const isEditing = typeof showPlayerForm === 'object';
    const updatedTeams = teams.map(t => {
      if (t.id === selectedTeamId) {
        const updatedPlayers = isEditing 
          ? t.players.map(p => p.id === (showPlayerForm as Player).id ? { ...p, name: formData.playerName, number: parseInt(formData.playerNum), position: formData.playerPos as any, goals: parseInt(formData.playerGoals) || 0, assists: parseInt(formData.playerAssists) || 0 } : p)
          : [...t.players, { id: `p${Date.now()}`, name: formData.playerName, number: parseInt(formData.playerNum) || 0, position: formData.playerPos as any, goals: parseInt(formData.playerGoals) || 0, assists: parseInt(formData.playerAssists) || 0, nationality: 'CHN' }];
        return { ...t, players: updatedPlayers };
      }
      return t;
    });

    setTeams(updatedTeams);
    setShowPlayerForm(false);
    setFormData({ ...formData, playerName: '', playerNum: '', playerPos: 'MF', playerGoals: '0', playerAssists: '0' });
  };

  const handleMatchSubmit = () => {
    if (!formData.matchHomeId || !formData.matchAwayId || !formData.matchDate) return;
    
    const scorers: GoalEvent[] = formData.matchScorersText.split(',').filter(s => s.trim()).map(s => {
      const fullMatch = s.match(/(.+?)(\[(.+?)\])?\((.+?)\)/);
      if (fullMatch) return { scorerName: fullMatch[1].trim(), assistantName: fullMatch[3]?.trim(), teamId: fullMatch[4].trim() };
      const simpleMatch = s.match(/(.+?)\((.+?)\)/);
      if (simpleMatch) return { scorerName: simpleMatch[1].trim(), teamId: simpleMatch[2].trim() };
      return { scorerName: s.trim(), teamId: formData.matchHomeId };
    });

    // 构建点球大战数据（仅当淘汰赛且比分相同时）
    let penaltyShootout = undefined;
    if (formData.matchStage === 'KNOCKOUT' && formData.matchHomeScore === formData.matchAwayScore) {
      penaltyShootout = {
        homePenaltyScore: parseInt(formData.matchHomePenaltyScore) || 0,
        awayPenaltyScore: parseInt(formData.matchAwayPenaltyScore) || 0
      };
    }

    const matchData: Match = {
      id: typeof showMatchForm === 'object' ? (showMatchForm as Match).id : `m${Date.now()}`,
      homeTeamId: formData.matchHomeId,
      awayTeamId: formData.matchAwayId,
      homeScore: parseInt(formData.matchHomeScore) || 0,
      awayScore: parseInt(formData.matchAwayScore) || 0,
      penaltyShootout,
      status: formData.matchStatus,
      date: `${formData.matchDate}T${formData.matchTime || '00:00'}:00Z`,
      venue: '重庆师范大学',
      scorers,
      stage: formData.matchStage,
      knockoutType: formData.matchStage === 'KNOCKOUT' ? formData.matchKnockoutType : undefined
    };

    if (typeof showMatchForm === 'object') {
      setMatches(matches.map(m => m.id === (showMatchForm as Match).id ? matchData : m));
    } else {
      setMatches([...matches, matchData]);
    }

    setShowMatchForm(false);
    setFormData({ 
      ...formData, 
      matchHomeId: '', matchAwayId: '', matchDate: '', matchTime: '', 
      matchHomeScore: '0', matchAwayScore: '0', matchStatus: 'SCHEDULED', 
      matchScorersText: '', matchStage: 'GROUP', matchKnockoutType: 'SEMIFINAL',
      matchHomePenaltyScore: '0', matchAwayPenaltyScore: '0'
    });
  };

  // 删除比赛
  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm('确定要删除这场比赛吗？')) {
      setMatches(matches.filter(m => m.id !== matchId));
    }
  };

  // 删除球队
  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('确定要删除这个球队吗？删除后相关的比赛记录也会被删除。')) {
      // 删除球队
      setTeams(teams.filter(t => t.id !== teamId));
      // 删除与该球队相关的比赛
      setMatches(matches.filter(m => m.homeTeamId !== teamId && m.awayTeamId !== teamId));
      // 如果当前选中的是被删除的球队，清除选中状态
      if (selectedTeamId === teamId) {
        setSelectedTeamId(null);
      }
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {activeView === 'STANDINGS' && <StandingsTable teams={teamsWithLiveStats} matches={matches} onDeleteMatch={handleDeleteMatch} />}
      {activeView === 'STATS' && <PlayerStats teams={teamsWithLiveStats} />}
      {activeView === 'MATCHES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">赛程安排</h2>
            <button onClick={() => setShowMatchForm(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">+ 新增赛程</button>
          </div>
          <MatchCenter matches={matches} teams={teamsWithLiveStats} onEditMatch={(m) => {
             const scorersText = m.scorers.map(s => `${s.scorerName}${s.assistantName ? `[${s.assistantName}]` : ''}(${s.teamId})`).join(',');
             setFormData({ 
               ...formData, 
               matchHomeId: m.homeTeamId, 
               matchAwayId: m.awayTeamId, 
               matchDate: m.date.split('T')[0], 
               matchTime: m.date.split('T')[1].substring(0, 5), 
               matchHomeScore: m.homeScore.toString(), 
               matchAwayScore: m.awayScore.toString(), 
               matchStatus: m.status, 
               matchScorersText: scorersText, 
               matchStage: m.stage, 
               matchKnockoutType: m.knockoutType || 'SEMIFINAL',
               matchHomePenaltyScore: m.penaltyShootout?.homePenaltyScore.toString() || '0',
               matchAwayPenaltyScore: m.penaltyShootout?.awayPenaltyScore.toString() || '0'
             });
             setShowMatchForm(m);
          }} onDeleteMatch={handleDeleteMatch} />
          {showMatchForm && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 text-slate-800">{typeof showMatchForm === 'object' ? '修改比赛记录' : '安排新赛程'}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select value={formData.matchHomeId} onChange={e => setFormData({...formData, matchHomeId: e.target.value})} className="w-full px-4 py-3 rounded-xl border">
                      <option value="">选择主队</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select value={formData.matchAwayId} onChange={e => setFormData({...formData, matchAwayId: e.target.value})} className="w-full px-4 py-3 rounded-xl border">
                      <option value="">选择客队</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={formData.matchDate} onChange={e => setFormData({...formData, matchDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border" />
                    <input type="time" value={formData.matchTime} onChange={e => setFormData({...formData, matchTime: e.target.value})} className="w-full px-4 py-3 rounded-xl border" />
                  </div>
                  <select value={formData.matchStage} onChange={e => setFormData({...formData, matchStage: e.target.value as 'GROUP' | 'KNOCKOUT'})} className="w-full px-4 py-3 rounded-xl border">
                    <option value="GROUP">第一阶段 - 小组赛</option>
                    <option value="KNOCKOUT">第二阶段 - 淘汰赛</option>
                  </select>
                  {formData.matchStage === 'KNOCKOUT' && (
                    <select value={formData.matchKnockoutType} onChange={e => setFormData({...formData, matchKnockoutType: e.target.value as 'SEMIFINAL' | 'FINAL' | 'THIRD_PLACE'})} className="w-full px-4 py-3 rounded-xl border">
                      <option value="SEMIFINAL">半决赛</option>
                      <option value="FINAL">决赛</option>
                      <option value="THIRD_PLACE">季军赛</option>
                    </select>
                  )}
                  <select value={formData.matchStatus} onChange={e => setFormData({...formData, matchStatus: e.target.value as any})} className="w-full px-4 py-3 rounded-xl border">
                    <option value="SCHEDULED">未开始</option>
                    <option value="FINISHED">已结束</option>
                  </select>
                  {formData.matchStatus === 'FINISHED' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="number" value={formData.matchHomeScore} onChange={e => setFormData({...formData, matchHomeScore: e.target.value})} placeholder="主队进球" className="w-full px-4 py-3 rounded-xl border" />
                        <input type="number" value={formData.matchAwayScore} onChange={e => setFormData({...formData, matchAwayScore: e.target.value})} placeholder="客队进球" className="w-full px-4 py-3 rounded-xl border" />
                      </div>
                      {/* 点球大战输入（仅当淘汰赛且比分相同时） */}
                      {formData.matchStage === 'KNOCKOUT' && formData.matchHomeScore === formData.matchAwayScore && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-slate-600">点球大战</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={formData.matchHomePenaltyScore} onChange={e => setFormData({...formData, matchHomePenaltyScore: e.target.value})} placeholder="主队点球" className="w-full px-4 py-3 rounded-xl border" />
                            <input type="number" value={formData.matchAwayPenaltyScore} onChange={e => setFormData({...formData, matchAwayPenaltyScore: e.target.value})} placeholder="客队点球" className="w-full px-4 py-3 rounded-xl border" />
                          </div>
                        </div>
                      )}
                      <textarea value={formData.matchScorersText} onChange={e => setFormData({...formData, matchScorersText: e.target.value})} className="w-full px-4 py-3 rounded-xl border h-24" placeholder="格式: 进球者[助攻者](队ID)..."></textarea>
                    </>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setShowMatchForm(false)} className="flex-1 px-4 py-3 bg-slate-100 rounded-xl font-bold">取消</button>
                    <button onClick={handleMatchSubmit} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold">保存修改</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {activeView === 'TEAMS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">队伍管理</h2>
            <button onClick={() => setShowTeamForm(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md">+ 添加球队</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamsWithLiveStats.map(team => (
              <div key={team.id} className="glass-panel p-6 rounded-2xl flex flex-col items-center hover:scale-105 transition-transform border border-transparent hover:border-emerald-200 group relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="text-[10px] font-bold text-slate-400">ID: {team.id}</span>
                  <button 
                    onClick={() => handleDeleteTeam(team.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-100 text-red-600 rounded-full text-xs font-bold hover:bg-red-200"
                  >
                    删除
                  </button>
                </div>
                <button onClick={() => setSelectedTeamId(team.id)} className="w-full flex flex-col items-center">
                  <img src={team.logo} className="w-20 h-20 rounded-full mb-4 shadow-lg border-2 border-white object-cover" alt="" />
                  <div className="text-lg font-bold text-slate-800">{team.name}</div>
                  <div className="text-xs text-slate-400 font-bold uppercase mt-1">{team.players.length} 名注册球员</div>
                </button>
              </div>
            ))}
          </div>

          {currentSelectedTeam && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-slate-900 p-8 text-white relative">
                  <button onClick={() => setSelectedTeamId(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white text-2xl">✕</button>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <img src={currentSelectedTeam.logo} className="w-24 h-24 rounded-full border-4 border-slate-800 object-cover" alt="" />
                      <button onClick={() => setIsEditingLogo(true)} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">修改队徽</button>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black">{currentSelectedTeam.name}</h3>
                      <p className="text-emerald-400 text-xs font-bold mt-1 tracking-widest">TEAM ID: {currentSelectedTeam.id}</p>
                    </div>
                  </div>
                </div>

                {isEditingLogo && (
                  <div className="p-4 bg-slate-50 border-b flex gap-2">
                    <input value={formData.teamLogo} onChange={e => setFormData({...formData, teamLogo: e.target.value})} placeholder="输入图片 URL..." className="flex-1 px-4 py-2 rounded-lg border" />
                    <button onClick={updateTeamLogo} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">更新</button>
                    <button onClick={() => setIsEditingLogo(false)} className="bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold">取消</button>
                  </div>
                )}

                <div className="p-8 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">球员大名单</h4>
                    <button onClick={() => {
                      setFormData({...formData, playerName: '', playerNum: '', playerGoals: '0', playerAssists: '0', playerPos: 'MF'});
                      setShowPlayerForm(true);
                    }} className="text-emerald-600 font-bold flex items-center gap-1 hover:underline">
                      + 注册新球员
                    </button>
                  </div>
                  <div className="space-y-3">
                    {currentSelectedTeam.players.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-2xl">暂无注册球员</div>
                    ) : (
                      currentSelectedTeam.players.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-xs font-black text-slate-400 border">{p.number}</span>
                            <div>
                              <div className="font-bold text-slate-800">{p.name}</div>
                              <div className="text-[10px] text-emerald-600 font-bold uppercase">{p.position}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right flex gap-4">
                              <div><div className="text-sm font-black text-slate-800">{p.goals}</div><div className="text-[8px] text-slate-400 uppercase">进球</div></div>
                              <div><div className="text-sm font-black text-slate-800">{p.assists}</div><div className="text-[8px] text-slate-400 uppercase">助攻</div></div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => {
                                setFormData({...formData, playerName: p.name, playerNum: p.number.toString(), playerPos: p.position, playerGoals: p.goals.toString(), playerAssists: p.assists.toString()});
                                setShowPlayerForm(p);
                              }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-emerald-600">✏️</button>
                              <button onClick={() => {
                                if (window.confirm('确定要删除这个球员吗？')) {
                                  const updatedTeams = teams.map(t => {
                                    if (t.id === selectedTeamId) {
                                      return { ...t, players: t.players.filter(player => player.id !== p.id) };
                                    }
                                    return t;
                                  });
                                  setTeams(updatedTeams);
                                }
                              }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600">🗑️</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 球员注册/编辑表单 (层级最高) */}
          {showPlayerForm && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-6 text-slate-800">{typeof showPlayerForm === 'object' ? '编辑球员信息' : '新球员注册'}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">姓名</label>
                    <input value={formData.playerName} onChange={e => setFormData({...formData, playerName: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="球员姓名" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">球衣号码</label>
                      <input type="number" value={formData.playerNum} onChange={e => setFormData({...formData, playerNum: e.target.value})} className="w-full px-4 py-3 rounded-xl border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">位置</label>
                      <select value={formData.playerPos} onChange={e => setFormData({...formData, playerPos: e.target.value as any})} className="w-full px-4 py-3 rounded-xl border bg-white">
                        <option value="GK">门将 (GK)</option>
                        <option value="DF">后卫 (DF)</option>
                        <option value="MF">中场 (MF)</option>
                        <option value="FW">前锋 (FW)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">基础进球</label>
                      <input type="number" value={formData.playerGoals} onChange={e => setFormData({...formData, playerGoals: e.target.value})} className="w-full px-4 py-3 rounded-xl border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">基础助攻</label>
                      <input type="number" value={formData.playerAssists} onChange={e => setFormData({...formData, playerAssists: e.target.value})} className="w-full px-4 py-3 rounded-xl border" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setShowPlayerForm(false)} className="flex-1 px-4 py-3 bg-slate-100 rounded-xl font-bold">返回</button>
                    <button onClick={handlePlayerSubmit} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold">完成并保存</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 添加球队表单 */}
          {showTeamForm && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">新增参赛球队</h3>
                <div className="space-y-4">
                  <input value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} placeholder="球队名称" className="w-full px-4 py-3 rounded-xl border" />
                  <input value={formData.teamShort} onChange={e => setFormData({...formData, teamShort: e.target.value})} placeholder="简称 (如: MATH)" className="w-full px-4 py-3 rounded-xl border" />
                  <input value={formData.teamLogo} onChange={e => setFormData({...formData, teamLogo: e.target.value})} placeholder="队徽图片 URL" className="w-full px-4 py-3 rounded-xl border" />
                  <div className="flex gap-3"><button onClick={() => setShowTeamForm(false)} className="flex-1 py-3 bg-slate-100 rounded-xl">取消</button><button onClick={addTeam} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">保存球队</button></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;

