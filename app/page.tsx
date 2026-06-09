'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { AppState } from '@/lib/types';
import { PARTICIPANTS } from '@/lib/participants';
import { getTeam } from '@/lib/teams';
import { executeDraw } from '@/lib/draw';
import { loadState, saveDraw, resetDraw, getTeamsForParticipant } from '@/lib/store';
import { isTeamEliminated } from '@/lib/bracket';
import { playAirHorn } from '@/lib/airhorn';
import { ParticipantCard } from '@/components/ParticipantCard';
import { Confetti } from '@/components/Confetti';

type DrawPhase = 'idle' | 'ceremony' | 'reveal-all' | 'complete';

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);
  const [phase, setPhase] = useState<DrawPhase>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [justRevealed, setJustRevealed] = useState(false);
  const [showRedrawModal, setShowRedrawModal] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    if (loaded.drawComplete) {
      setPhase('complete');
      setRevealedSet(new Set(PARTICIPANTS.map((_, i) => i)));
    }
  }, []);

  const handleStartIndividualDraw = useCallback(() => {
    const results = executeDraw();
    const newState = saveDraw(results);
    setState(newState);
    setPhase('ceremony');
    setCurrentIndex(0);
    setRevealedSet(new Set());
    setJustRevealed(false);
  }, []);

  const handleDrawAll = useCallback(() => {
    const results = executeDraw();
    const newState = saveDraw(results);
    setState(newState);
    setRevealedSet(new Set(PARTICIPANTS.map((_, i) => i)));
    setPhase('reveal-all');
    playAirHorn();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 6000);
  }, []);

  const handleReveal = useCallback(() => {
    setRevealedSet((prev) => new Set(prev).add(currentIndex));
    setJustRevealed(true);
    playAirHorn();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
    setTimeout(() => setJustRevealed(false), 1500);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < PARTICIPANTS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setJustRevealed(false);
    } else if (revealedSet.size === PARTICIPANTS.length) {
      setPhase('complete');
    }
  }, [currentIndex, revealedSet]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setJustRevealed(false);
    }
  }, [currentIndex]);

  const handleRedraw = useCallback(() => {
    const newState = resetDraw();
    setState(newState);
    setPhase('idle');
    setCurrentIndex(0);
    setRevealedSet(new Set());
    setShowRedrawModal(false);
    setJustRevealed(false);
  }, []);

  const eliminatedTeams = new Set<string>();
  if (state) {
    for (const match of state.matches) {
      if (match.status === 'completed' && match.team1Code && match.team2Code) {
        if (match.score1 !== null && match.score2 !== null) {
          const loserCode =
            match.score1 > match.score2 ? match.team2Code : match.team1Code;
          if (isTeamEliminated(loserCode, state.matches)) {
            eliminatedTeams.add(loserCode);
          }
        }
      }
    }
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- PRE-DRAW ---
  if (phase === 'idle') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
            <span className="text-gold">World Cup 2026</span>
            <br />
            <span className="text-text-primary">Sweepstake</span>
          </h1>
          <p className="mt-4 text-text-secondary text-xl">
            24 participants. 48 teams. 2 teams each.
            <br />
            Fair draw — no one gets two top-10 ranked teams.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartIndividualDraw}
              className="px-10 py-5 bg-gold text-bg font-medium text-xl rounded-xl
                         hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
            >
              Individual Draw
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDrawAll}
              className="px-10 py-5 bg-white/10 text-text-primary font-normal text-xl rounded-xl
                         border border-border-subtle hover:bg-white/20 transition-colors"
            >
              Draw All
            </motion.button>
          </div>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {PARTICIPANTS.map((p) => (
              <div
                key={p.id}
                className="bg-surface-raised border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-secondary"
              >
                {p.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // --- CEREMONY (one at a time) ---
  if (phase === 'ceremony') {
    const participant = PARTICIPANTS[currentIndex];
    const isRevealed = revealedSet.has(currentIndex);
    const teams = getTeamsForParticipant(participant.id, state.drawResults);
    const allRevealed = revealedSet.size === PARTICIPANTS.length;
    const progress = revealedSet.size;

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Confetti active={showConfetti} />

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal uppercase tracking-wider text-text-muted">
              Drawing
            </span>
            <span className="text-xs text-text-muted">
              {progress} of {PARTICIPANTS.length} revealed
            </span>
          </div>
          <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold rounded-full"
              initial={false}
              animate={{ width: `${(progress / PARTICIPANTS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Main card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="bg-surface-raised border border-border-subtle rounded-2xl p-8 sm:p-12 text-center min-h-[340px] flex flex-col items-center justify-center"
          >
            {/* Participant name */}
            <motion.h2
              className="text-4xl sm:text-5xl font-light text-gold mb-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {participant.name}
            </motion.h2>

            {isRevealed && teams ? (
              <div className="space-y-4 w-full max-w-xs">
                {teams.map((code, i) => {
                  const team = getTeam(code);
                  if (!team) return null;
                  return (
                    <motion.div
                      key={code}
                      initial={justRevealed ? { scale: 0, opacity: 0 } : false}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: justRevealed ? 0.2 + i * 0.4 : 0,
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="bg-bg border border-gold/20 rounded-xl p-4 flex items-center gap-4"
                    >
                      <span className="text-4xl">{team.flag}</span>
                      <div className="text-left">
                        <p className="font-normal text-lg text-text-primary">
                          {team.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {team.confederation} — FIFA #{team.fifaRanking}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReveal}
                className="px-8 py-4 bg-gold text-bg font-medium text-lg rounded-xl
                           hover:bg-gold-light transition-colors shadow-lg shadow-gold/20
                           animate-pulse-gold"
              >
                Draw Teams
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 bg-white/5 border border-border-subtle rounded-lg text-sm
                       font-medium text-text-secondary hover:bg-white/10 transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &larr; Back
          </button>

          <span className="text-sm text-text-muted font-mono">
            {currentIndex + 1} / {PARTICIPANTS.length}
          </span>

          {allRevealed ? (
            <button
              onClick={() => setPhase('complete')}
              className="px-5 py-2.5 bg-gold/10 border border-gold/20 rounded-lg text-sm
                         font-medium text-gold hover:bg-gold/20 transition-colors"
            >
              View All &rarr;
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIndex === PARTICIPANTS.length - 1}
              className="px-5 py-2.5 bg-white/5 border border-border-subtle rounded-lg text-sm
                         font-medium text-text-secondary hover:bg-white/10 transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next &rarr;
            </button>
          )}
        </div>

        {/* Redraw button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowRedrawModal(true)}
            className="text-xs text-text-muted hover:text-eliminated transition-colors"
          >
            Redraw All
          </button>
        </div>

        {/* Redraw Modal */}
        {showRedrawModal && (
          <RedrawModal
            onConfirm={handleRedraw}
            onCancel={() => setShowRedrawModal(false)}
          />
        )}
      </div>
    );
  }

  // --- REVEAL ALL (instant draw) ---
  if (phase === 'reveal-all') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Confetti active={showConfetti} />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
            <span className="text-gold">The Draw</span>
          </h1>
          <p className="mt-3 text-text-secondary text-xl">All teams revealed!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPhase('complete')}
            className="mt-6 px-6 py-3 bg-gold text-bg font-medium rounded-xl
                       hover:bg-gold-light transition-colors"
          >
            Continue
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {PARTICIPANTS.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <ParticipantCard
                participant={participant}
                teams={getTeamsForParticipant(participant.id, state.drawResults)}
                index={index}
                revealed={true}
                eliminatedTeams={eliminatedTeams}
              />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // --- COMPLETE (grid view) ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Confetti active={showConfetti} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
          <span className="text-gold">World Cup 2026</span>
          <br />
          <span className="text-text-primary">Sweepstake</span>
        </h1>
        <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
          <p className="text-text-muted text-sm">
            Draw completed{' '}
            {state.drawTimestamp &&
              new Date(state.drawTimestamp).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
          </p>
          <button
            onClick={() => setShowRedrawModal(true)}
            className="text-xs text-text-muted hover:text-eliminated transition-colors"
          >
            Redraw
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href="/leaderboard"
            className="px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-lg text-sm font-medium hover:bg-gold/20 transition-colors"
          >
            Leaderboard
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {PARTICIPANTS.map((participant, index) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            teams={getTeamsForParticipant(participant.id, state.drawResults)}
            index={index}
            revealed={true}
            eliminatedTeams={eliminatedTeams}
          />
        ))}
      </div>

      {/* Scoring Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 border-t border-border-subtle pt-8"
      >
        <h2 className="text-sm font-normal uppercase tracking-wider text-text-muted mb-4">
          Scoring System
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { round: 'R32 Win', pts: 1 },
            { round: 'R16 Win', pts: 2 },
            { round: 'QF Win', pts: 4 },
            { round: 'SF Win', pts: 8 },
            { round: 'Final Win', pts: 16 },
            { round: 'Champion Bonus', pts: 16 },
          ].map(({ round, pts }) => (
            <div
              key={round}
              className="bg-surface-raised border border-border-subtle rounded-lg p-3 text-center"
            >
              <p className="text-gold font-mono font-normal text-lg">{pts} pts</p>
              <p className="text-text-muted text-xs mt-1">{round}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {showRedrawModal && (
        <RedrawModal
          onConfirm={handleRedraw}
          onCancel={() => setShowRedrawModal(false)}
        />
      )}
    </div>
  );
}

function RedrawModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface border border-border-subtle rounded-xl p-6 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-3xl mb-3">⚠️</div>
        <h3 className="text-lg font-normal text-text-primary mb-2">Redraw All?</h3>
        <p className="text-text-secondary text-sm mb-6">
          This will clear all current draw results and start a completely new draw.
          This cannot be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-white/10 text-text-secondary rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-eliminated text-white rounded-lg text-sm font-normal hover:bg-red-500 transition-colors"
          >
            Confirm Redraw
          </button>
        </div>
      </motion.div>
    </div>
  );
}
