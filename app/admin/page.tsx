'use client';

import { useEffect, useState } from 'react';
import { AppState, Match, Round, ROUND_LABELS } from '@/lib/types';
import { loadState, saveMatches } from '@/lib/store';
import { propagateResults, getMatchesByRound } from '@/lib/bracket';
import { TEAMS, getTeam } from '@/lib/teams';

const KNOCKOUT_ROUNDS: Round[] = ['r32', 'r16', 'qf', 'sf', 'final', 'third'];

export default function AdminPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    team1Code: '',
    team2Code: '',
    score1: '',
    score2: '',
    status: 'scheduled' as Match['status'],
    date: '',
    venue: '',
  });
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-gold mb-6 text-center">
          Admin Panel
        </h1>
        <div className="bg-surface-raised border border-border-subtle rounded-xl p-6">
          <label className="block text-sm text-text-secondary mb-2">
            Admin Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password === 'wc2026') {
                setAuthenticated(true);
              }
            }}
            className="w-full bg-navy border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-gold/50"
            placeholder="Enter password"
          />
          <button
            onClick={() => {
              if (password === 'wc2026') setAuthenticated(true);
              else alert('Incorrect password');
            }}
            className="mt-4 w-full py-2 bg-gold text-navy font-bold rounded-lg hover:bg-gold-light transition-colors"
          >
            Login
          </button>
          <p className="mt-3 text-xs text-text-muted text-center">
            Default password: wc2026
          </p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const byRound = getMatchesByRound(state.matches);

  function startEdit(match: Match) {
    setEditing(match.id);
    setForm({
      team1Code: match.team1Code ?? '',
      team2Code: match.team2Code ?? '',
      score1: match.score1?.toString() ?? '',
      score2: match.score2?.toString() ?? '',
      status: match.status,
      date: match.date ?? '',
      venue: match.venue ?? '',
    });
  }

  function saveEdit() {
    if (!editing || !state) return;

    const score1 = form.score1 === '' ? null : parseInt(form.score1, 10);
    const score2 = form.score2 === '' ? null : parseInt(form.score2, 10);

    if (form.score1 !== '' && (isNaN(score1!) || score1! < 0)) {
      alert('Please enter valid scores');
      return;
    }
    if (form.score2 !== '' && (isNaN(score2!) || score2! < 0)) {
      alert('Please enter valid scores');
      return;
    }
    if (form.status === 'completed' && score1 === score2) {
      alert('Completed matches must have a winner (no draws in knockout)');
      return;
    }

    const updated = state.matches.map((m) =>
      m.id === editing
        ? {
            ...m,
            team1Code: form.team1Code || null,
            team2Code: form.team2Code || null,
            score1,
            score2,
            status: form.status,
            date: form.date || null,
            venue: form.venue || null,
          }
        : m,
    );

    const propagated = propagateResults(updated);
    const newState = saveMatches(propagated);
    setState(newState);
    setEditing(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gold">Admin Panel</h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage match results and bracket progression
          </p>
        </div>
        <button
          onClick={() => setAuthenticated(false)}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          Logout
        </button>
      </div>

      {!state.drawComplete && (
        <div className="bg-live-bg border border-live/30 rounded-xl p-4 mb-8">
          <p className="text-live text-sm font-medium">
            Draw has not been completed yet. Go to the home page to execute the
            draw before updating match results.
          </p>
        </div>
      )}

      {KNOCKOUT_ROUNDS.map((round) => {
        const roundMatches = byRound[round] || [];
        if (roundMatches.length === 0) return null;

        return (
          <div key={round} className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-3">
              {ROUND_LABELS[round]}
            </h2>
            <div className="space-y-2">
              {roundMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-surface-raised border border-border-subtle rounded-lg overflow-hidden"
                >
                  {editing === match.id ? (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-text-muted block mb-1">
                            Team 1
                          </label>
                          <select
                            value={form.team1Code}
                            onChange={(e) =>
                              setForm({ ...form, team1Code: e.target.value })
                            }
                            className="w-full bg-navy border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary"
                          >
                            <option value="">TBD</option>
                            {TEAMS.map((t) => (
                              <option key={t.code} value={t.code}>
                                {t.flag} {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">
                            Team 2
                          </label>
                          <select
                            value={form.team2Code}
                            onChange={(e) =>
                              setForm({ ...form, team2Code: e.target.value })
                            }
                            className="w-full bg-navy border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary"
                          >
                            <option value="">TBD</option>
                            {TEAMS.map((t) => (
                              <option key={t.code} value={t.code}>
                                {t.flag} {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-text-muted block mb-1">
                            Score 1
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={form.score1}
                            onChange={(e) =>
                              setForm({ ...form, score1: e.target.value })
                            }
                            className="w-full bg-navy border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">
                            Score 2
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={form.score2}
                            onChange={(e) =>
                              setForm({ ...form, score2: e.target.value })
                            }
                            className="w-full bg-navy border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">
                            Status
                          </label>
                          <select
                            value={form.status}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                status: e.target.value as Match['status'],
                              })
                            }
                            className="w-full bg-navy border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-text-muted block mb-1">
                            Date
                          </label>
                          <input
                            type="datetime-local"
                            value={form.date}
                            onChange={(e) =>
                              setForm({ ...form, date: e.target.value })
                            }
                            className="w-full bg-navy border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted block mb-1">
                            Venue
                          </label>
                          <input
                            type="text"
                            value={form.venue}
                            onChange={(e) =>
                              setForm({ ...form, venue: e.target.value })
                            }
                            className="w-full bg-navy border border-border-subtle rounded px-2 py-1.5 text-sm text-text-primary"
                            placeholder="Stadium name"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveEdit}
                          className="px-4 py-1.5 bg-gold text-navy font-bold text-sm rounded-lg hover:bg-gold-light transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="px-4 py-1.5 bg-white/10 text-text-secondary text-sm rounded-lg hover:bg-white/20 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(match)}
                      className="w-full p-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-text-muted w-12">
                          {match.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <TeamDisplay code={match.team1Code} />
                          <span className="text-text-muted text-xs">vs</span>
                          <TeamDisplay code={match.team2Code} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {match.status === 'completed' && (
                          <span className="font-mono font-bold text-sm">
                            {match.score1} - {match.score2}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            match.status === 'completed'
                              ? 'bg-white/10 text-text-secondary'
                              : match.status === 'live'
                                ? 'bg-live/20 text-live'
                                : 'bg-white/5 text-text-muted'
                          }`}
                        >
                          {match.status.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TeamDisplay({ code }: { code: string | null }) {
  if (!code) {
    return <span className="text-text-muted text-sm italic">TBD</span>;
  }
  const team = getTeam(code);
  if (!team) return <span className="text-sm">{code}</span>;
  return (
    <span className="flex items-center gap-1 text-sm">
      <span>{team.flag}</span>
      <span>{team.name}</span>
    </span>
  );
}
