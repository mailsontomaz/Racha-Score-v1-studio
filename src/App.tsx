/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Users, 
  Trophy, 
  Play, 
  Trash2, 
  ChevronRight, 
  Share2, 
  FileText, 
  Calendar,
  Dices,
  MonitorCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Button, 
  Input, 
  Card, 
  SectionHeader, 
  Chip 
} from './components/DesignSystem';
import { cn } from './lib/utils';
import { 
  Player, 
  Team, 
  Match, 
  MatchEvent, 
  RachaSession, 
  GameFormat 
} from './types';
import { RACHA_TEAMS, FORMATS, SCORING_RULES } from './constants';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function App() {
  // Persistence
  const [savedPlayers, setSavedPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('racha_saved_players');
    return saved ? JSON.parse(saved) : [];
  });

  const [session, setSession] = useState<RachaSession | null>(null);
  const [view, setView] = useState<'HOME' | 'SETUP' | 'FORMAT' | 'TEAMS' | 'LIVE' | 'SUMMARY'>('HOME');
  
  // Setup state
  const [peladaName, setPeladaName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [playerInput, setPlayerInput] = useState('');
  const [sessionPlayers, setSessionPlayers] = useState<Player[]>([]);

  // Team Assignment State
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualTeams, setManualTeams] = useState<Team[]>([]);
  const [activeManualTeamIndex, setActiveManualTeamIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('racha_saved_players', JSON.stringify(savedPlayers));
  }, [savedPlayers]);

  const handleStartNew = () => {
    setView('SETUP');
  };

  const addPlayer = (name: string) => {
    if (!name.trim()) return;
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
    };
    
    setSessionPlayers([...sessionPlayers, newPlayer]);
    setPlayerInput('');
    
    // Auto-save to global list if not already there
    if (!savedPlayers.find(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      setSavedPlayers(prev => [...prev, { ...newPlayer, saved: true }]);
    }
  };

  const removePlayer = (id: string) => {
    setSessionPlayers(sessionPlayers.filter(p => p.id !== id));
  };

  const handleFinishSetup = () => {
    if (!peladaName || !organizerName || sessionPlayers.length < playersPerTeam * 2) {
      alert('Preencha os dados e adicione jogadores suficientes (mínimo 2 times)');
      return;
    }
    setView('FORMAT');
  };

  const handleViewDemo = () => {
    // Sample data from PDF
    const demoPlayers: Player[] = [
      { id: 'p1', name: 'Robinho' },
      { id: 'p2', name: 'Viana' },
      { id: 'p3', name: 'Araujo' },
      { id: 'p4', name: 'Mauro' },
      { id: 'p5', name: 'Monteiro' },
      { id: 'p6', name: 'Everton' },
      { id: 'p7', name: 'Romero' },
      { id: 'p8', name: 'Andre Luiz' },
      { id: 'p9', name: 'Antonio' },
      { id: 'p10', name: 'Sorin' },
      { id: 'p11', name: 'Jander' },
      { id: 'p12', name: 'Joao Vitor' }
    ];

    const team1Base = RACHA_TEAMS[0]; // Jumentus
    const team2Base = RACHA_TEAMS[5]; // Horriver Plate
    
    const team1: Team = {
      ...team1Base,
      players: demoPlayers.slice(0, 6),
      goalkeeperId: 'p1', // Robinho as keeper
      score: 31.5,
      stats: { goals: 8, assists: 8, tacklesReal: 2, tacklesFake: 0, savesEasy: 0, savesDifficult: 0, frangos: 0, yellowCards: 0, redCards: 0, ownGoals: 0 }
    };
    
    const team2: Team = {
      ...team2Base,
      players: demoPlayers.slice(6, 12),
      goalkeeperId: 'p7', // Romero as keeper
      score: 38.0,
      stats: { goals: 7, assists: 0, tacklesReal: 8, tacklesFake: 0, savesEasy: 0, savesDifficult: 0, frangos: 0, yellowCards: 0, redCards: 0, ownGoals: 0 }
    };

    const demoSession: RachaSession = {
      id: 'demo-session',
      name: 'Areias do Polo 2026',
      organizer: 'Viana',
      date: '16/04/2026',
      playerCount: 6,
      format: 'todos-contra-todos',
      players: demoPlayers,
      teams: [team1, team2],
      matches: [
        {
          id: 'm1',
          team1Id: team1.id,
          team2Id: team2.id,
          score1: 2,
          score2: 1,
          status: 'finished',
          events: [
            { id: 'e1', type: 'goal', playerId: 'p1', playerName: 'Robinho', teamId: team1.id, gameTime: '12:30', timestamp: Date.now() },
            { id: 'e2', type: 'goal', playerId: 'p2', playerName: 'Viana', teamId: team1.id, gameTime: '14:20', timestamp: Date.now() + 1000 },
            { id: 'e3', type: 'goal', playerId: 'p7', playerName: 'Romero', teamId: team2.id, gameTime: '18:45', timestamp: Date.now() + 2000 }
          ]
        }
      ],
      status: 'finished'
    };

    setSession(demoSession);
    setView('SUMMARY');
  };

  const handleSelectFormat = (format: GameFormat) => {
    const newSession: RachaSession = {
      id: Math.random().toString(36).substr(2, 9),
      name: peladaName,
      organizer: organizerName,
      date: new Date().toLocaleDateString('pt-BR'),
      playerCount: playersPerTeam,
      format,
      players: sessionPlayers,
      teams: [],
      matches: [],
      status: 'setup'
    };
    setSession(newSession);
    setView('TEAMS');
  };

  const finalizeTeams = (teams: Team[]) => {
    if (!session) return;
    setSession({ ...session, teams, status: 'live' });
    setView('LIVE');
  };

  const conductRandomSort = () => {
    if (!session) return;
    setIsRandomizing(true);
    
    setTimeout(() => {
      const shuffled = [...session.players].sort(() => Math.random() - 0.5);
      const numTeams = Math.floor(shuffled.length / session.playerCount);
      const teams: Team[] = [];
      
      for (let i = 0; i < numTeams; i++) {
        const teamBase = RACHA_TEAMS[i % RACHA_TEAMS.length];
        const teamPlayers = shuffled.slice(i * session.playerCount, (i + 1) * session.playerCount);
        
        teams.push({
          id: teamBase.id,
          name: teamBase.name,
          color: teamBase.color,
          players: teamPlayers,
          score: 0,
          stats: { goals: 0, assists: 0, tacklesReal: 0, tacklesFake: 0, savesEasy: 0, savesDifficult: 0, frangos: 0, yellowCards: 0, redCards: 0, ownGoals: 0 }
        });
      }
      
      finalizeTeams(teams);
      setIsRandomizing(false);
    }, 1500);
  };

  const startManualSelection = () => {
    if (!session) return;
    const numTeams = Math.floor(session.players.length / session.playerCount);
    const initialTeams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
      ...RACHA_TEAMS[i % RACHA_TEAMS.length],
      players: [],
      score: 0,
      stats: { goals: 0, assists: 0, tacklesReal: 0, tacklesFake: 0, savesEasy: 0, savesDifficult: 0, frangos: 0, yellowCards: 0, redCards: 0, ownGoals: 0 }
    }));
    setManualTeams(initialTeams);
    setIsManualMode(true);
    setActiveManualTeamIndex(0);
  };

  const togglePlayerInManualTeam = (player: Player) => {
    const isAssigned = manualTeams.some(t => t.players.some(p => p.id === player.id));
    
    if (isAssigned) {
      // Remove from whatever team it's in
      setManualTeams(manualTeams.map(t => ({
        ...t,
        players: t.players.filter(p => p.id !== player.id),
        goalkeeperId: t.goalkeeperId === player.id ? undefined : t.goalkeeperId
      })));
    } else {
      // Add to active team if not full
      if (manualTeams[activeManualTeamIndex].players.length < (session?.playerCount || 5)) {
        setManualTeams(manualTeams.map((t, i) => i === activeManualTeamIndex ? {
          ...t,
          players: [...t.players, player]
        } : t));
      }
    }
  };

  const setManualGoalkeeper = (playerId: string) => {
    setManualTeams(manualTeams.map((t, i) => i === activeManualTeamIndex ? {
      ...t,
      goalkeeperId: t.goalkeeperId === playerId ? undefined : playerId
    } : t));
  };

  // Live Score State
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [eventDraft, setEventDraft] = useState<{ type: MatchEvent['type'], teamId: string } | null>(null);

  const startMatch = (t1Id: string, t2Id: string) => {
    const match: Match = {
      id: Math.random().toString(36).substr(2, 9),
      team1Id: t1Id,
      team2Id: t2Id,
      score1: 0,
      score2: 0,
      status: 'live',
      startTime: Date.now(),
      events: []
    };
    setCurrentMatch(match);
  };

  const addMatchEvent = (type: MatchEvent['type'], playerId: string, teamId: string) => {
    if (!currentMatch || !session) return;
    
    const playerName = session.players.find(p => p.id === playerId)?.name || 'Jogador';
    const newEvent: MatchEvent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      playerId,
      playerName,
      teamId,
      timestamp: Date.now(),
      gameTime: Math.floor((Date.now() - (currentMatch.startTime || 0)) / 60000) + "'"
    };

    const updatedMatch = { ...currentMatch, events: [...currentMatch.events, newEvent] };
    if (type === 'goal') {
      if (teamId === currentMatch.team1Id) updatedMatch.score1 += 1;
      else updatedMatch.score2 += 1;
    } else if (type === 'ownGoal') {
      // Score goes to opposite team
      if (teamId === currentMatch.team1Id) updatedMatch.score2 += 1;
      else updatedMatch.score1 += 1;
    }
    
    setCurrentMatch(updatedMatch);
  };

  const finishMatch = () => {
    if (!currentMatch || !session) return;
    
    const finishedMatch: Match = { ...currentMatch, status: 'finished', endTime: Date.now() };
    
    // Update team stats based on match
    const updatedTeams = session.teams.map(team => {
      const matchEvents = finishedMatch.events.filter(e => e.teamId === team.id);
      
      const newStats = { ...team.stats };
      matchEvents.forEach(e => {
        if (e.type === 'goal') newStats.goals += 1;
        if (e.type === 'assist') newStats.assists += 1;
        if (e.type === 'tackleReal') newStats.tacklesReal += 1;
        if (e.type === 'tackleFake') newStats.tacklesFake += 1;
        if (e.type === 'saveEasy') newStats.savesEasy += 1;
        if (e.type === 'saveDifficult') newStats.savesDifficult += 1;
        if (e.type === 'frango') newStats.frangos += 1;
        if (e.type === 'yellow') newStats.yellowCards += 1;
        if (e.type === 'red') newStats.redCards += 1;
        if (e.type === 'ownGoal') newStats.ownGoals += 1;
      });

      let teamSessionScore = team.score;
      if (team.id === finishedMatch.team1Id) {
        if (finishedMatch.score1 > finishedMatch.score2) teamSessionScore += SCORING_RULES.win;
        else if (finishedMatch.score1 === finishedMatch.score2) teamSessionScore += SCORING_RULES.draw;
      } else if (team.id === finishedMatch.team2Id) {
        if (finishedMatch.score2 > finishedMatch.score1) teamSessionScore += SCORING_RULES.win;
        else if (finishedMatch.score1 === finishedMatch.score2) teamSessionScore += SCORING_RULES.draw;
      }

      return { ...team, stats: newStats, score: teamSessionScore };
    });

    setSession({ 
      ...session, 
      matches: [...session.matches, finishedMatch],
      teams: updatedTeams 
    });
    setCurrentMatch(null);
  };

  const endSession = () => {
    if (!session) return;
    setSession({ ...session, status: 'finished' });
    setView('SUMMARY');
  };

  // PDF Export
  const summaryRef = useRef<HTMLDivElement>(null);
  const exportPDF = async () => {
    if (!summaryRef.current) return;
    const canvas = await html2canvas(summaryRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`Racha-Score-${session?.name || 'Session'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-bg text-white selection:bg-racha-lime selection:text-black font-sans">
      <div className={cn(
        "min-h-screen relative overflow-hidden flex",
        view === 'HOME' || view === 'SETUP' || view === 'FORMAT' ? "max-w-md mx-auto flex-col p-6" : "flex-col md:flex-row"
      )}>
        {/* Sidebar - Only visible in Dashboard views on desktop */}
        {!(view === 'HOME' || view === 'SETUP' || view === 'FORMAT') && (
          <aside className="hidden md:flex w-64 bg-bg-elev border-r border-border shrink-0 flex-col p-6 gap-8 z-20">
            <div className="font-display font-black text-xl tracking-tighter uppercase text-racha-lime">
              Racha<span className="text-white">Score</span>
            </div>
            
            <nav className="flex flex-col gap-1">
              <div className="text-[10px] uppercase tracking-widest text-racha-sand mb-2 font-bold opacity-50">Menu Principal</div>
              <button 
                onClick={() => setView('LIVE')}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all",
                  view === 'LIVE' ? "bg-racha-lime/10 text-racha-lime border-l-2 border-racha-lime" : "text-racha-sand hover:bg-white/5"
                )}
              >
                <MonitorCheck size={18} />
                Painel do Racha
              </button>
              <button 
                onClick={() => setView('SUMMARY')}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all",
                  view === 'SUMMARY' ? "bg-racha-lime/10 text-racha-lime border-l-2 border-racha-lime" : "text-racha-sand hover:bg-white/5"
                )}
              >
                <Trophy size={18} />
                Classificação
              </button>
            </nav>

            <div className="mt-auto">
               <Card variant="sunken" className="p-3">
                 <div className="text-[10px] uppercase text-racha-sand mb-2 opacity-50">Status da Rodada</div>
                 <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-racha-lime w-2/3" />
                 </div>
                 <div className="mt-2 text-[10px] font-mono text-racha-lime">SESSÃO ATIVA</div>
               </Card>
            </div>
          </aside>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className={cn(
            "flex items-center justify-between z-10 shrink-0",
            view === 'HOME' || view === 'SETUP' || view === 'FORMAT' ? "mb-8" : "p-6 md:px-10 border-b border-border bg-bg/50 backdrop-blur-md"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "bg-racha-lime rounded-lg flex items-center justify-center border-none",
                view === 'HOME' || view === 'SETUP' || view === 'FORMAT' ? "w-10 h-10" : "w-8 h-8 md:hidden"
              )}>
                 <Trophy className="text-black w-5 h-5" />
              </div>
              <div>
                <h1 className={cn(
                  "font-display font-black tracking-tighter uppercase leading-none",
                  view === 'HOME' || view === 'SETUP' || view === 'FORMAT' ? "text-2xl" : "text-lg"
                )}>
                  {!(view === 'HOME' || view === 'SETUP' || view === 'FORMAT') && session ? (
                    <>
                      <span className="block">{session.name}</span>
                      <span className="text-[10px] text-racha-sand font-bold block mt-0.5 opacity-60 px-0.5">Org: {session.organizer}</span>
                    </>
                  ) : (
                    <>Racha<span className="text-racha-lime italic">Score</span></>
                  )}
                </h1>
              </div>
            </div>
            {session && (
              <div className="flex items-center gap-3">
                <Chip variant="default" className="hidden sm:inline-flex">{session.date}</Chip>
                {view === 'LIVE' && currentMatch && <Chip variant="live">AO VIVO</Chip>}
              </div>
            )}
          </header>

          {/* Main Content Area */}
          <main className={cn(
            "flex-1 z-10 w-full",
            view === 'HOME' || view === 'SETUP' || view === 'FORMAT' ? "" : "p-6 md:p-10 max-w-5xl"
          )}>
            <AnimatePresence mode="wait">
            {view === 'HOME' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 text-center pt-10"
              >
                <div className="relative inline-block">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-32 h-32 border-4 border-dashed border-white/5 rounded-full" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white fill-racha-lime drop-shadow-lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-black uppercase italic tracking-tight text-white">O racha vai começar<span className="text-racha-coral">!</span></h2>
                  <p className="text-racha-sand font-medium">Organize times, acompanhe gols e gere o boletim da várzea.</p>
                </div>
                <Button onClick={handleStartNew} size="lg" isBlock className="mt-8">
                  Nova Pelada
                </Button>
                <Button onClick={handleViewDemo} variant="ink" size="lg" isBlock className="mt-2 border-dashed">
                  Visualizar Layout (Modo Demo)
                </Button>
                
                {savedPlayers.length > 0 && (
                  <Card variant="sunken" className="p-4 mt-10">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-racha-sand mb-3 text-left">Jogadores Salvos ({savedPlayers.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {savedPlayers.slice(0, 5).map(p => (
                        <Chip key={p.id}>{p.name}</Chip>
                      ))}
                      {savedPlayers.length > 5 && <Chip variant="ink">+{savedPlayers.length - 5}</Chip>}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}

            {view === 'SETUP' && (
              <motion.div 
                key="setup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <SectionHeader eyebrow="Passo 01" title="Configuração" count={sessionPlayers.length} />
                
                <div className="space-y-4">
                  <Input 
                    label="Nome da Pelada" 
                    placeholder="Ex: Racha dos Amigos" 
                    value={peladaName} 
                    onChange={e => setPeladaName(e.target.value)} 
                  />
                  <Input 
                    label="Nome do Organizador" 
                    placeholder="Ex: Viana" 
                    value={organizerName} 
                    onChange={e => setOrganizerName(e.target.value)} 
                  />
                  
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input 
                        label="Adicionar Jogador" 
                        placeholder="Nome do atleta" 
                        value={playerInput} 
                        onChange={e => setPlayerInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addPlayer(playerInput)}
                      />
                    </div>
                    <Button variant="ink" size="icon" onClick={() => addPlayer(playerInput)}>
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>

                  {/* Player List */}
                  <Card variant="sunken" className="min-h-[200px] max-h-[300px] overflow-y-auto p-2">
                    <div className="space-y-2">
                      {sessionPlayers.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-bg-elev border border-border rounded-lg p-3 shadow-sm">
                          <span className="font-cond font-bold uppercase tracking-tight text-white">{p.name}</span>
                          <button onClick={() => removePlayer(p.id)} className="text-racha-coral hover:bg-racha-coral/10 p-1 rounded transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {sessionPlayers.length === 0 && (
                        <div className="h-40 flex flex-col items-center justify-center text-white/10 italic">
                          <Users size={32} className="mb-2" />
                          <p>Nenhum jogador na lista</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-racha-sand px-1 mb-1 block">Jogadores por Time</label>
                      <div className="flex items-center border border-border rounded-xl bg-bg-sunk overflow-hidden">
                        <button onClick={() => setPlayersPerTeam(Math.max(2, playersPerTeam - 1))} className="flex-1 py-3 hover:bg-border text-white font-bold transition-colors">-</button>
                        <span className="flex-1 text-center font-mono font-bold text-xl text-racha-lime">{playersPerTeam}</span>
                        <button onClick={() => setPlayersPerTeam(playersPerTeam + 1)} className="flex-1 py-3 hover:bg-border text-white font-bold transition-colors">+</button>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleFinishSetup} isBlock variant="primary" size="lg">
                        Próximo
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'FORMAT' && (
              <motion.div 
                key="format"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <SectionHeader eyebrow="Passo 02" title="Formato" />
                <div className="grid gap-4">
                  {FORMATS.map(f => (
                    <button 
                      key={f.id}
                      onClick={() => handleSelectFormat(f.id as GameFormat)}
                      className="group relative overflow-hidden bg-bg-elev border border-border p-6 rounded-2xl text-left hover:bg-white/5 transition-all shadow-sm"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <MonitorCheck size={80} />
                      </div>
                      <div className="relative z-10">
                        <h3 className="font-display font-black text-xl italic uppercase tracking-tighter text-white">{f.label}</h3>
                        <p className="text-sm text-racha-sand font-cond font-bold uppercase tracking-widest mt-1">Disputa de Racha</p>
                      </div>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-racha-lime group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'TEAMS' && (
              <motion.div 
                key="teams"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {!isManualMode ? (
                  <>
                    <SectionHeader eyebrow="Passo 03" title="Equipes" count={session?.players.length} />
                    <div className="grid gap-6 py-4">
                      <div className="space-y-4">
                        <Button 
                           onClick={conductRandomSort} 
                           disabled={isRandomizing}
                           isBlock 
                           size="lg" 
                           variant="primary"
                           className="h-24"
                        >
                          {isRandomizing ? (
                            <div className="flex items-center gap-3">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                <Dices size={32} />
                              </motion.div>
                              <span>Sorteando atletas...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Dices size={32} />
                              <div className="text-left">
                                <p className="text-lg">Randomizar Atletas</p>
                                <p className="text-xs opacity-60 font-medium lowercase">Deixa o destino escolher os times</p>
                              </div>
                            </div>
                          )}
                        </Button>
                        
                        <div className="relative h-[1px] bg-border rounded-full flex items-center justify-center">
                          <span className="bg-bg px-4 font-mono text-[10px] text-racha-sand uppercase font-black">Ou</span>
                        </div>

                        <Button onClick={startManualSelection} variant="secondary" isBlock size="lg" className="h-24">
                           <div className="flex items-center gap-3">
                              <Users size={32} />
                              <div className="text-left">
                                <p className="text-lg">Escolha Manual</p>
                                <p className="text-xs opacity-60 font-medium lowercase text-racha-sand">Organizador define cada grupo</p>
                              </div>
                            </div>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <SectionHeader eyebrow="Montagem de Times" title="Seleção Manual" count={session?.players.length} />
                    
                    {/* Team Tabs */}
                    <div className="flex gap-2 p-1 bg-bg-sunk rounded-xl overflow-x-auto no-scrollbar border border-border">
                      {manualTeams.map((team, idx) => (
                        <button
                          key={team.id}
                          onClick={() => setActiveManualTeamIndex(idx)}
                          className={cn(
                            "flex-1 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all min-w-[100px]",
                            activeManualTeamIndex === idx ? "bg-bg-elev text-white border border-border shadow-sm scale-[1.02]" : "text-racha-sand opacity-40 hover:opacity-60"
                          )}
                        >
                          <div className="w-2 h-2 rounded-full mb-1 mx-auto" style={{ backgroundColor: team.color }} />
                          {team.name}
                          <div className="mt-1 text-racha-lime font-mono shrink-0">({team.players.length}/{session?.playerCount})</div>
                        </button>
                      ))}
                    </div>

                    <Card variant="sunken" className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                      {session?.players.map(player => {
                        const assignedTeam = manualTeams.find(t => t.players.some(p => p.id === player.id));
                        const isAssignedToThis = assignedTeam?.id === manualTeams[activeManualTeamIndex].id;
                        
                        return (
                          <button
                            key={player.id}
                            onClick={() => togglePlayerInManualTeam(player)}
                            className={cn(
                              "relative p-3 rounded-xl border text-[11px] font-cond font-bold uppercase tracking-tight text-center transition-all",
                              isAssignedToThis ? "bg-racha-lime text-black border-racha-lime shadow-lg scale-[1.02]" : 
                              assignedTeam ? "bg-bg-elev text-white opacity-20 border-border cursor-not-allowed grayscale" :
                              "bg-bg-elev text-white border-border hover:border-racha-lime/50"
                            )}
                          >
                            <div className="flex flex-col items-center">
                              <span>{player.name}</span>
                              {isAssignedToThis && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setManualGoalkeeper(player.id); }}
                                  className={cn(
                                    "mt-1 px-1.5 py-0.5 rounded text-[7px] border transition-all flex items-center gap-1",
                                    manualTeams[activeManualTeamIndex].goalkeeperId === player.id 
                                      ? "bg-black text-racha-lime border-black" 
                                      : "bg-white/20 text-black border-black/10"
                                  )}
                                >
                                  🧤 {manualTeams[activeManualTeamIndex].goalkeeperId === player.id ? 'GOLEIRO' : 'SER GOLEIRO'}
                                </button>
                              )}
                            </div>
                            {isAssignedToThis && <div className="absolute -top-1.5 -right-1.5 bg-black text-racha-lime w-4 h-4 rounded-full flex items-center justify-center text-[8px] border border-racha-lime shadow-sm">✓</div>}
                          </button>
                        );
                      })}
                    </Card>

                    <div className="flex gap-3">
                      <Button variant="ink" onClick={() => setIsManualMode(false)} className="flex-1">Voltar</Button>
                      <Button 
                        variant="primary" 
                        disabled={manualTeams.some(t => t.players.length < (session?.playerCount || 1))}
                        onClick={() => finalizeTeams(manualTeams)}
                        className="flex-[2]"
                      >
                        Confirmar Times
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'LIVE' && session && (
              <motion.div 
                key="live"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <header className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none italic text-white">{session.name}</h2>
                    <p className="font-mono text-[10px] text-racha-sand uppercase font-bold mt-1">Sessão Ativa · {session.format}</p>
                  </div>
                  <Button variant="coral" size="sm" onClick={endSession}>Finalizar</Button>
                </header>

                {currentMatch ? (
                  <div className="space-y-6">
                    {/* Active Match Scoreboard */}
                    <Card variant="ink" className="relative p-8">
                       <div className="absolute top-3 left-1/2 -translate-x-1/2">
                          <Chip variant="live">Live · {currentMatch.status}</Chip>
                       </div>
                       
                       <div className="flex items-center justify-between gap-4 mt-4">
                          <div className="flex flex-col items-center gap-2 flex-1">
                             <div 
                               className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-4"
                               style={{ backgroundColor: session.teams.find(t => t.id === currentMatch.team1Id)?.color, borderColor: '#fff' }}
                             >
                               {session.teams.find(t => t.id === currentMatch.team1Id)?.name?.substring(0, 2).toUpperCase() || '??'}
                             </div>
                             <span className="font-cond font-black text-[10px] uppercase text-white/60 truncate w-full text-center">{session.teams.find(t => t.id === currentMatch.team1Id)?.name}</span>
                          </div>
                          
                          <div className="text-6xl font-display font-black italic tracking-tighter flex items-center gap-2">
                             {currentMatch.score1} <span className="text-2xl text-white/20">×</span> {currentMatch.score2}
                          </div>

                          <div className="flex flex-col items-center gap-2 flex-1">
                             <div 
                               className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-4"
                               style={{ backgroundColor: session.teams.find(t => t.id === currentMatch.team2Id)?.color, borderColor: '#fff' }}
                             >
                               {session.teams.find(t => t.id === currentMatch.team2Id)?.name?.substring(0, 2).toUpperCase() || '??'}
                             </div>
                             <span className="font-cond font-black text-[10px] uppercase text-white/60 truncate w-full text-center">{session.teams.find(t => t.id === currentMatch.team2Id)?.name}</span>
                          </div>
                       </div>
                    </Card>

                    {/* Action Panel */}
                    <div className="grid grid-cols-2 gap-4">
                       {[currentMatch.team1Id, currentMatch.team2Id].map((teamId, idx) => {
                         const team = session.teams.find(t => t.id === teamId);
                         return (
                           <div key={teamId} className="space-y-4">
                             <p className="font-mono text-center text-[10px] font-black uppercase tracking-[0.2em] text-racha-sand px-2 truncate border-b border-border/50 pb-2">{team?.name}</p>
                             <div className="grid grid-cols-2 gap-2">
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  className="text-[10px] py-4 h-auto col-span-1 shadow-lg"
                                  onClick={() => setEventDraft({ type: 'goal', teamId })}
                                >+ GOL</Button>
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  className="text-[10px] py-4 h-auto col-span-1"
                                  onClick={() => setEventDraft({ type: 'assist', teamId })}
                                >+ ASS</Button>
                                
                                <div className="col-span-2 grid grid-cols-2 gap-2 mt-1">
                                  <Button 
                                    variant="ghost" 
                                    className="border border-border text-[9px] py-2.5 h-auto bg-bg-elev hover:bg-white/5"
                                    size="sm"
                                    onClick={() => setEventDraft({ type: 'tackleReal', teamId })}
                                  >Des. Real</Button>
                                  <Button 
                                    variant="ghost" 
                                    className="border border-border text-[9px] py-2.5 h-auto bg-bg-elev hover:bg-white/5 opacity-60"
                                    size="sm"
                                    onClick={() => setEventDraft({ type: 'tackleFake', teamId })}
                                  >Des. Fake</Button>
                                  <Button 
                                    variant="ghost" 
                                    className="border border-border text-[9px] py-2.5 h-auto bg-bg-elev hover:bg-white/5"
                                    size="sm"
                                    onClick={() => setEventDraft({ type: 'saveEasy', teamId })}
                                  >Def. Fácil</Button>
                                  <Button 
                                    variant="ghost" 
                                    className="border border-border text-[9px] py-2.5 h-auto bg-bg-elev hover:bg-white/5"
                                    size="sm"
                                    onClick={() => setEventDraft({ type: 'saveDifficult', teamId })}
                                  >Def. Dificil</Button>
                                </div>

                                <Button 
                                  variant="ghost" 
                                  className="border-dashed border-racha-coral/30 text-[9px] py-2.5 h-auto text-racha-coral bg-racha-coral/5 hover:bg-racha-coral/10 col-span-1"
                                  size="sm"
                                  onClick={() => setEventDraft({ type: 'ownGoal', teamId })}
                                >G. Contra</Button>
                                <Button 
                                  variant="coral" 
                                  size="sm"
                                  className="text-[9px] py-2.5 h-auto font-black shadow-lg col-span-1"
                                  onClick={() => setEventDraft({ type: 'frango', teamId })}
                                >Frango</Button>

                                <div className="grid grid-cols-2 gap-2 col-span-2 mt-2">
                                   <button 
                                     onClick={() => setEventDraft({ type: 'yellow', teamId })} 
                                     className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 text-black text-[9px] font-black uppercase py-2.5 rounded-lg transition-all shadow-md active:scale-95 border-b-2 border-yellow-700" 
                                   >
                                     AMARELO
                                   </button>
                                   <button 
                                     onClick={() => setEventDraft({ type: 'red', teamId })} 
                                     className="flex items-center justify-center bg-red-600 hover:bg-red-500 text-white text-[9px] font-black uppercase py-2.5 rounded-lg transition-all shadow-md active:scale-95 border-b-2 border-red-900" 
                                   >
                                     VERMELHO
                                   </button>
                                </div>
                             </div>
                           </div>
                         );
                       })}
                    </div>

                    <Button isBlock size="lg" variant="primary" onClick={finishMatch}>
                      Encerrar Jogo
                    </Button>

                    <div className="mt-8 space-y-3">
                       <h4 className="font-mono text-[10px] uppercase font-black text-racha-sand/40 tracking-widest pl-2">Lances da Partida</h4>
                       <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {currentMatch.events.slice().reverse().map(e => (
                             <div key={e.id} className="flex items-center gap-3 bg-bg-elev p-3 rounded-xl border border-border transition-all">
                                <span className="font-mono text-xs font-black text-racha-sand/30 tracking-tighter">{e.gameTime}</span>
                                <span className="flex-1 font-cond font-bold text-[10px] uppercase text-white">
                                   {e.type === 'goal' && '⚽ GOL DE '}
                                   {e.type === 'assist' && '➟ ASSISTÊNCIA DE '}
                                   {e.type === 'tackleReal' && '🛡️ DESARME (R) DE '}
                                   {e.type === 'tackleFake' && '🛡️ DESARME (F) DE '}
                                   {e.type === 'saveEasy' && '🧤 DEFESA (F) DE '}
                                   {e.type === 'saveDifficult' && '🧤 DEFESA (D) DE '}
                                   {e.type === 'frango' && '🐔 FRANGO DE '}
                                   {e.type === 'ownGoal' && '🤕 GOL CONTRA DE '}
                                   {e.type === 'yellow' && '🟨 AMARELO PARA '}
                                   {e.type === 'red' && '🟥 VERMELHO PARA '}
                                   <b className="text-racha-lime">{e.playerName}</b>
                                </span>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <SectionHeader title="Confrontos" eyebrow="Próximas Partidas" />
                    
                    {/* Generate matchups simple for Racha */}
                    <div className="space-y-4">
                      {session.teams.length >= 2 && (
                        <Card className="p-6">
                           <div className="flex items-center justify-between gap-6">
                              <div className="flex-1 text-center">
                                 <div className="w-12 h-12 border border-white/10 rounded-full mx-auto mb-2 flex items-center justify-center font-black" style={{ backgroundColor: session.teams[0].color }}>
                                   {session.teams[0]?.name?.substring(0, 2).toUpperCase() || '??'}
                                 </div>
                                 <p className="font-cond font-black uppercase text-sm truncate text-white">{session.teams[0].name}</p>
                              </div>
                              <span className="font-display font-black italic text-2xl opacity-10 whitespace-nowrap">VS</span>
                              <div className="flex-1 text-center">
                                 <div className="w-12 h-12 border border-white/10 rounded-full mx-auto mb-2 flex items-center justify-center font-black" style={{ backgroundColor: session.teams[1].color }}>
                                   {session.teams[1]?.name?.substring(0, 2).toUpperCase() || '??'}
                                 </div>
                                 <p className="font-cond font-black uppercase text-sm truncate text-white">{session.teams[1].name}</p>
                              </div>
                           </div>
                           <Button 
                             onClick={() => startMatch(session.teams[0].id, session.teams[1].id)}
                             isBlock 
                             className="mt-6"
                           >Apitar Começo</Button>
                        </Card>
                      )}
                      
                      <div className="mt-8 space-y-4">
                        <SectionHeader title="Tabela" eyebrow="Classificação Hoje" />
                        <div className="rk overflow-hidden rounded-2xl border border-border">
                          <table className="w-full text-left font-mono text-xs border-collapse">
                            <thead className="bg-bg-sunk uppercase font-black text-racha-sand/50 border-b border-border">
                              <tr>
                                <th className="p-3 text-white/40">Equipe</th>
                                <th className="p-3 text-right text-white/40">Pts</th>
                                <th className="p-3 text-right text-white/40">G</th>
                              </tr>
                            </thead>
                            <tbody>
                              {session.teams.sort((a,b) => b.score - a.score).map((team, i) => (
                                <tr key={team.id} className="bg-bg-elev border-b border-border hover:bg-white/5 transition-colors">
                                  <td className="p-3 flex items-center gap-2 font-cond font-black uppercase tracking-tight text-white">
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] border border-white/10" style={{ backgroundColor: team.color }}>{i+1}</span>
                                    {team.name}
                                  </td>
                                  <td className="p-3 text-right font-bold text-racha-lime">{team.score.toFixed(2).replace('.', ',')}</td>
                                  <td className="p-3 text-right text-racha-sand/40">{team.stats.goals}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'SUMMARY' && session && (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div ref={summaryRef} className="bg-bg-elev p-6 rounded-2xl border border-border shadow-card space-y-6">
                  <div className="text-center space-y-1 mb-8">
                     <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-racha-sand mb-2 font-bold opacity-50">Boletim da Várzea · {session.date}</div>
                     <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter leading-tight text-white">RESUMO FINAL</h2>
                     <p className="font-cond font-black text-xl uppercase tracking-tighter text-racha-lime">{session.name}</p>
                  </div>

                  <div className="space-y-6 text-white">
                    <div>
                      <h4 className="font-cond font-black text-sm uppercase mb-3 border-b border-white/5 pb-1 flex items-center justify-between">
                        <span className="text-racha-sand italic">Ranking da Várzea</span>
                        <Trophy size={14} className="text-racha-lime" />
                      </h4>
                      <div className="rk overflow-hidden rounded-xl border border-border">
                        <table className="w-full text-left font-mono text-[9px] border-collapse bg-bg-elev">
                          <thead className="bg-bg-sunk uppercase font-black text-racha-sand opacity-40">
                            <tr>
                              <th className="p-2">Pos</th>
                              <th className="p-2">Nome</th>
                              <th className="p-2 text-center">G</th>
                              <th className="p-2 text-center">A</th>
                              <th className="p-2 text-center">DR</th>
                              <th className="p-2 text-center">DF</th>
                              <th className="p-2 text-right">Pts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {session.players.map(p => {
                              const pEvents = session.matches.flatMap(m => m.events).filter(e => e.playerId === p.id);
                              const g = pEvents.filter(e => e.type === 'goal').length;
                              const a = pEvents.filter(e => e.type === 'assist').length;
                              const dr = pEvents.filter(e => e.type === 'tackleReal').length;
                              const df = pEvents.filter(e => e.type === 'frango').length;
                              
                              const calcPoints = () => {
                                let pts = 5.0; // Assiduidade
                                pts += g * 1.0 + a * 1.0 + dr * 1.0 + pEvents.filter(e => e.type === 'tackleFake').length * 0.5;
                                pts += pEvents.filter(e => e.type === 'saveEasy').length * 1.0 + pEvents.filter(e => e.type === 'saveDifficult').length * 2.0;
                                pts += df * -2.0 + pEvents.filter(e => e.type === 'ownGoal').length * -1.0;
                                pts += pEvents.filter(e => e.type === 'yellow').length * -1.0 + pEvents.filter(e => e.type === 'red').length * -3.0;
                                
                                // Volume bonuses
                                if (g >= 2) pts += (g === 2 ? 1 : g === 3 ? 2 : g === 4 ? 3 : 4);
                                if (a >= 2) pts += (a === 2 ? 1 : a === 3 ? 2 : a === 4 ? 3 : 4);
                                if (dr >= 2) pts += (dr <= 3 ? 1 : dr === 4 ? 2 : dr === 5 ? 3 : 4);
                                
                                // Team Win points (+1 per win)
                                const wins = session.matches.filter(m => {
                                  const t1 = session.teams.find(t => t.id === m.team1Id);
                                  const t2 = session.teams.find(t => t.id === m.team2Id);
                                  if (t1?.players.some(pl => pl.id === p.id)) return m.score1 > m.score2;
                                  if (t2?.players.some(pl => pl.id === p.id)) return m.score2 > m.score1;
                                  return false;
                                }).length;
                                pts += wins * 1.0;

                                // Final Standing Bonus
                                const sortedTeams = [...session.teams].sort((a,b) => b.score - a.score);
                                if (sortedTeams[0]?.players.some(pl => pl.id === p.id)) pts += 5.0; // 1st Place
                                else if (sortedTeams[1]?.players.some(pl => pl.id === p.id)) pts += 2.5; // 2nd Place
                                
                                return pts;
                              };
                              return { p, g, a, dr, df, pts: calcPoints() };
                            }).sort((a,b) => b.pts - a.pts).map((item, i) => (
                              <tr key={item.p.id} className="border-t border-white/5">
                                <td className="p-2 opacity-30 italic">#{i+1}</td>
                                <td className="p-2 font-cond font-bold uppercase truncate max-w-[80px]">{item.p.name}</td>
                                <td className="p-2 text-center">{item.g}</td>
                                <td className="p-2 text-center">{item.a}</td>
                                <td className="p-2 text-center">{item.dr}</td>
                                <td className="p-2 text-center text-racha-coral">{item.df}</td>
                                <td className="p-2 text-right font-black text-racha-lime">{item.pts.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <Card variant="flat" className="p-4 bg-racha-lime/5 border-dashed border-racha-lime/20">
                          <p className="font-mono text-[8px] uppercase font-black mb-1 text-racha-lime/60 italic">Melhor em Campo</p>
                          <div className="font-cond font-black text-xl uppercase tracking-tighter text-white truncate">
                             {(() => {
                               const sorted = session.players.map(p => {
                                 const pEvents = session.matches.flatMap(m => m.events).filter(e => e.playerId === p.id);
                                 const g = pEvents.filter(e => e.type === 'goal').length;
                                 const pts = 5.0 + g * 1.0 + pEvents.filter(e => e.type === 'assist').length * 1.0; // Simple check for top
                                 return { name: p.name, pts };
                               }).sort((a,b) => b.pts - a.pts);
                               return sorted[0]?.name || '---';
                             })()}
                          </div>
                          <p className="font-mono text-[8px] uppercase text-racha-sand opacity-40">The Best</p>
                       </Card>
                       <Card variant="flat" className="p-4 bg-racha-coral/5 border-dashed border-racha-coral/20">
                          <p className="font-mono text-[8px] uppercase font-black mb-1 text-racha-coral/60 italic">Frangômetro</p>
                          <div className="font-cond font-black text-xl uppercase tracking-tighter text-white">
                             {session.teams.reduce((acc, t) => acc + t.stats.frangos, 0)}
                          </div>
                          <p className="font-mono text-[8px] uppercase text-racha-sand opacity-40">Total falhas</p>
                       </Card>
                    </div>

                    <div>
                       <h4 className="font-cond font-black text-sm uppercase mb-3 border-b border-border pb-1 text-racha-sand italic">Highlights da Várzea</h4>
                       <div className="space-y-4">
                          {/* Top Scorer */}
                          {(() => {
                            const topScorer = session.teams.flatMap(t => t.players).reduce((best, p) => {
                               const count = session.matches.reduce((acc, m) => acc + m.events.filter(e => e.playerId === p.id && e.type === 'goal').length, 0);
                               return count > best.count ? { player: p, count } : best;
                            }, { player: null as Player | null, count: 0 });
                            
                            if (topScorer.count > 0 && topScorer.player) return (
                              <div className="flex items-center justify-between font-mono text-xs py-2 border-b border-white/5">
                                <span className="uppercase font-black text-white flex items-center gap-2"><Trophy size={14} className="text-racha-lime" /> Artilheiro: {topScorer.player.name}</span>
                                <span className="text-racha-lime font-black italic">{topScorer.count} GOLS</span>
                              </div>
                            );
                            return null;
                          })()}

                          {/* Best Assister */}
                          {(() => {
                            const topAssister = session.teams.flatMap(t => t.players).reduce((best, p) => {
                               const count = session.matches.reduce((acc, m) => acc + m.events.filter(e => e.playerId === p.id && e.type === 'assist').length, 0);
                               return count > best.count ? { player: p, count } : best;
                            }, { player: null as Player | null, count: 0 });
                            
                            if (topAssister.count > 0 && topAssister.player) return (
                              <div className="flex items-center justify-between font-mono text-xs py-2 border-b border-white/5">
                                <span className="uppercase font-black text-white flex items-center gap-2 font-cond"><Users size={14} className="text-racha-sand" /> Garçom: {topAssister.player.name}</span>
                                <span className="text-racha-sand font-black italic">{topAssister.count} ASS</span>
                              </div>
                            );
                            return null;
                          })()}

                          {/* Top Tackler */}
                          {(() => {
                            const topTackler = session.teams.flatMap(t => t.players).reduce((best, p) => {
                               const count = session.matches.reduce((acc, m) => acc + m.events.filter(e => e.playerId === p.id && e.type === 'tackle').length, 0);
                               return count > best.count ? { player: p, count } : best;
                            }, { player: null as Player | null, count: 0 });
                            
                            if (topTackler.count > 0 && topTackler.player) return (
                              <div className="flex items-center justify-between font-mono text-xs py-2 border-b border-white/5">
                                <span className="uppercase font-black text-white flex items-center gap-2 font-cond"><MonitorCheck size={14} className="text-racha-sand" /> Xerife: {topTackler.player.name}</span>
                                <span className="text-racha-sand font-black italic">{topTackler.count} DESARMES</span>
                              </div>
                            );
                            return null;
                          })()}

                          {/* Best Goalkeeper (Paredão) */}
                          {(() => {
                            const topKeeper = session.players.reduce((best, p) => {
                               const count = session.matches.reduce((acc, m) => acc + m.events.filter(e => e.playerId === p.id && e.type === 'saveDifficult').length, 0);
                               return count > best.count ? { player: p, count } : best;
                            }, { player: null as Player | null, count: 0 });
                            
                            if (topKeeper.count > 0 && topKeeper.player) return (
                              <div className="flex items-center justify-between font-mono text-xs py-2 border-b border-white/5">
                                <span className="uppercase font-black text-white flex items-center gap-2 font-cond"><MonitorCheck size={14} className="text-racha-lime" /> Paredão: {topKeeper.player.name}</span>
                                <span className="text-racha-lime font-black italic">{topKeeper.count} DEF. DIF.</span>
                              </div>
                            );
                            return null;
                          })()}
                       </div>
                    </div>
                  </div>

                  <div className="pt-8 text-center text-white">
                    <div className="bg-bg-sunk p-4 rounded-xl border border-border">
                      <p className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">Organização</p>
                      <p className="font-display font-black uppercase text-xl italic tracking-tight text-racha-lime">{session.organizer}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" onClick={() => setView('HOME')} size="lg" isBlock>
                     Início
                  </Button>
                  <Button variant="primary" onClick={exportPDF} size="lg" isBlock>
                     <FileText size={20} />
                     PDF
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {eventDraft && session && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="w-full max-w-sm bg-bg border border-border rounded-t-3xl md:rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase font-black tracking-widest text-racha-lime">Registrar Evento</p>
                    <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter text-white">
                      {eventDraft.type === 'goal' && 'Quem marcou?'}
                      {eventDraft.type === 'assist' && 'Garçom da vez?'}
                      {eventDraft.type.startsWith('tackle') && 'Quem desarmou?'}
                      {eventDraft.type.startsWith('save') && 'Muralha?'}
                      {eventDraft.type === 'frango' && 'Quem falhou?'}
                      {eventDraft.type === 'ownGoal' && 'Quem marcou contra?'}
                      {eventDraft.type === 'yellow' && 'Quem levou o amarelo?'}
                      {eventDraft.type === 'red' && 'Quem foi expulso?'}
                    </h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEventDraft(null)}>
                     <Trash2 size={20} className="text-racha-coral" />
                  </Button>
                </div>

                <div className="grid gap-2">
                  {session.teams.find(t => t.id === eventDraft.teamId)?.players.map(player => (
                    <button
                      key={player.id}
                      onClick={() => {
                        addMatchEvent(eventDraft.type, player.id, eventDraft.teamId);
                        setEventDraft(null);
                      }}
                      className="flex items-center justify-between p-4 bg-bg-elev border border-border rounded-2xl hover:border-racha-lime transition-all text-white font-cond font-black uppercase italic"
                    >
                      {player.name}
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Plus size={16} className="text-racha-lime" />
                      </div>
                    </button>
                  ))}
                  
                  <button
                    onClick={() => {
                      addMatchEvent(eventDraft.type, 'guest', eventDraft.teamId);
                      setEventDraft(null);
                    }}
                    className="mt-2 flex items-center justify-center p-4 bg-bg-sunk border border-dashed border-border rounded-2xl text-xs font-mono font-bold uppercase text-racha-sand/40 tracking-widest hover:border-white/20 transition-all"
                  >
                    Convidado / Outro
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between z-10 shrink-0 p-6 md:px-10">
          <div className="font-mono text-[8px] uppercase tracking-widest text-racha-sand font-black opacity-30">
            Areias do Polo · v0.1
          </div>
          <div className="flex gap-4">
            <button className="text-racha-sand/20 hover:text-white transition-colors cursor-pointer"><Share2 size={14} /></button>
            <button className="text-racha-sand/20 hover:text-white transition-colors cursor-pointer"><Calendar size={14} /></button>
          </div>
        </footer>
      </div>
    </div>
  </div>
);
}
