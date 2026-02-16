/* =======================================
   DATA.JS — Tournament Database
   =======================================
   ✏️  EASY EDITING GUIDE:
   - To update a player: change their goals, assists, rating, motm
   - To add a player photo: set photo to the image path, e.g. 'photos/player1.jpg'
   - To update standings: change wins, draws, losses, goalsFor, goalsAgainst, form
   - Points (pts), matches played (mp), goal difference (gd) are AUTO-COMPUTED
   ======================================= */


/* ─────────────────────────────────────────
   TEAMS — Edit standings here
   ───────────────────────────────────────── */

const teamsData = [
  {
    name: 'FC Thunder',
    emoji: '⚡',
    color: '#3b82f6',
    cssClass: 'thunder',       // used for CSS modifiers like team-logo--thunder
    founded: 2026,

    // ✏️ STANDINGS — just edit these numbers:
    wins: 3,
    draws: 1,
    losses: 0,
    goalsFor: 12,
    goalsAgainst: 4,
    form: ['W', 'W', 'D', 'W'],   // most recent results (latest last)
  },
  {
    name: 'Red Wolves',
    emoji: '🐺',
    color: '#ef4444',
    cssClass: 'wolves',
    founded: 2026,

    wins: 4,
    draws: 0,
    losses: 1,
    goalsFor: 12,
    goalsAgainst: 9,
    form: ['W', 'W', 'W', 'L'],
  },
  {
    name: 'Green Eagles',
    emoji: '🦅',
    color: '#10b981',
    cssClass: 'eagles',
    founded: 2026,

    wins: 1,
    draws: 1,
    losses: 2,
    goalsFor: 7,
    goalsAgainst: 10,
    form: ['L', 'W', 'D', 'L'],
  },
];


/* ─────────────────────────────────────────
   PLAYERS — Edit stats here
   ─────────────────────────────────────────
   photo: set to image path (e.g. 'photos/carlos.jpg')
          leave as null → shows initials fallback
   ───────────────────────────────────────── */

const playersData = [
  // ——— FC Thunder ———
  { id: 1, name: 'Carlos Rivera', team: 'FC Thunder', position: 'Forward', photo: null, goals: 18, assists: 3, cleanSheets: 0, motm: 4 },
  { id: 2, name: 'David Okonkwo', team: 'FC Thunder', position: 'Midfielder', photo: null, goals: 3, assists: 5, cleanSheets: 0, motm: 1 },
  { id: 3, name: "Liam O'Brien", team: 'FC Thunder', position: 'Defender', photo: null, goals: 1, assists: 2, cleanSheets: 3, motm: 0 },
  { id: 4, name: 'Kenji Mori', team: 'FC Thunder', position: 'Defender', photo: null, goals: 0, assists: 1, cleanSheets: 3, motm: 1 },

  // ——— Red Wolves ———
  { id: 5, name: 'Marcus Johnson', team: 'Red Wolves', position: 'Forward', photo: null, goals: 6, assists: 2, cleanSheets: 0, motm: 2 },
  { id: 6, name: 'Yuki Tanaka', team: 'Red Wolves', position: 'Midfielder', photo: null, goals: 11, assists: 4, cleanSheets: 0, motm: 0 },
  { id: 7, name: 'Diego Morales', team: 'Red Wolves', position: 'Defender', photo: null, goals: 1, assists: 0, cleanSheets: 1, motm: 0 },
  { id: 8, name: 'Viktor Petrov', team: 'Red Wolves', position: 'Defender', photo: null, goals: 0, assists: 0, cleanSheets: 1, motm: 0 },

  // ——— Green Eagles ———
  { id: 9, name: 'Ahmed Hassan', team: 'Green Eagles', position: 'Midfielder', photo: null, goals: 2, assists: 7, cleanSheets: 0, motm: 3 },
  { id: 10, name: 'Leo Martínez', team: 'Green Eagles', position: 'Forward', photo: null, goals: 5, assists: 4, cleanSheets: 0, motm: 1 },
  { id: 11, name: 'Samuel Nkemelu', team: 'Green Eagles', position: 'Defender', photo: null, goals: 0, assists: 1, cleanSheets: 2, motm: 0 },
  { id: 12, name: 'Tomás Herrera', team: 'Green Eagles', position: 'Defender', photo: null, goals: 0, assists: 0, cleanSheets: 2, motm: 0 },
];


/* ─────────────────────────────────────────
   HELPER FUNCTIONS (used by script.js)
   ───────────────────────────────────────── */

/** Look up team data by team name */
function getTeamByName(teamName) {
  return teamsData.find(t => t.name === teamName);
}

/** Auto-compute standings fields for a team */
function computeStandings(team) {
  const mp = team.wins + team.draws + team.losses;
  const pts = (team.wins * 3) + team.draws;
  const gd = team.goalsFor - team.goalsAgainst;
  return { ...team, mp, pts, gd };
}

/** Get sorted standings (by pts → gd → goalsFor) */
function getSortedStandings() {
  return teamsData
    .map(computeStandings)
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.goalsFor - a.goalsFor);
}


/* ─────────────────────────────────────────
   AUTO-RATING SYSTEM
   Computes player ratings (6.0–10.0) based on:
   • Position-weighted stats (goals, assists, clean sheets)
   • Team strength (win rate)
   • MOTM awards
   ───────────────────────────────────────── */

/** Position-specific stat weights */
const RATING_WEIGHTS = {
  Forward: { goals: 0.14, assists: 0.07, cleanSheets: 0.03 },
  Midfielder: { goals: 0.09, assists: 0.12, cleanSheets: 0.05 },
  Defender: { goals: 0.05, assists: 0.05, cleanSheets: 0.15 },
};

/**
 * Compute auto-rating for a player (6.0 – 10.0)
 * Base 6.0 + position-weighted stats + team strength + MOTM
 */
function computeAutoRating(player) {
  const BASE = 6.0;
  const w = RATING_WEIGHTS[player.position] || RATING_WEIGHTS.Midfielder;

  // Position-weighted stat contribution
  let score = BASE;
  score += player.goals * w.goals;
  score += player.assists * w.assists;
  score += (player.cleanSheets || 0) * w.cleanSheets;

  // MOTM bonus: +0.2 per award
  score += (player.motm || 0) * 0.2;

  // Team strength bonus (0 – 0.6): based on win rate
  const team = getTeamByName(player.team);
  if (team) {
    const mp = team.wins + team.draws + team.losses;
    if (mp > 0) {
      const winRate = team.wins / mp;
      const drawBonus = (team.draws / mp) * 0.3; // draws count partially
      score += (winRate + drawBonus) * 0.6;
    }
  }

  // Clamp to 6.0–10.0, round to 1 decimal
  return Math.round(Math.min(10.0, Math.max(6.0, score)) * 10) / 10;
}

/** Apply auto-ratings to all players on load */
playersData.forEach(p => { p.rating = computeAutoRating(p); });

/**
 * Build player avatar HTML.
 * If player has a photo → <img> tag
 * If no photo → circle with team-colored initials
 */
function getPlayerAvatar(player, size = 44) {
  const team = getTeamByName(player.team);
  const color = team ? team.color : '#6366f1';

  if (player.photo) {
    return `<img src="${player.photo}" alt="${player.name}"
              style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;"
              loading="lazy" decoding="async" />`;
  }

  // Initials fallback
  const initials = player.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const fontSize = Math.round(size * 0.38);
  return `<div class="avatar-initial" style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color}22;border:2px solid ${color}33;
    display:flex;align-items:center;justify-content:center;
    font-family:'Outfit',sans-serif;font-weight:800;
    font-size:${fontSize}px;color:${color};
    letter-spacing:0.5px;flex-shrink:0;">
    ${initials}
  </div>`;
}


/* ─────────────────────────────────────────
   BEST TEAMS — Auto-select 2 Best XIs
   ───────────────────────────────────────── */

/**
 * Maps raw positions to pitch rows.
 * Forward → Attack, Midfielder → Midfield, Defender → Defense
 */
function mapPositionToRow(position) {
  switch (position) {
    case 'Forward': return 'Attack';
    case 'Midfielder': return 'Midfield';
    case 'Defender': return 'Defense';
    default: return 'Midfield';
  }
}

/**
 * Compute composite score for a player.
 * score = (goals × 3) + (assists × 2) + (cleanSheets × 2) + rating
 */
function playerScore(p) {
  return (p.goals * 3) + (p.assists * 2) + ((p.cleanSheets || 0) * 2) + p.rating;
}

/**
 * Build 2 Best Teams of the Tournament.
 * Each team has 4 players: at least 1 per position (Attack, Midfield, Defense),
 * then the 4th slot goes to the next-best remaining player.
 */
function getBestTeams() {
  const rows = ['Attack', 'Midfield', 'Defense'];

  // Score and enrich all players
  const scored = playersData
    .map(p => ({ ...p, compositeScore: playerScore(p), pitchRow: mapPositionToRow(p.position) }))
    .sort((a, b) => b.compositeScore - a.compositeScore);

  function pickTeam(pool) {
    const team = [];
    const used = new Set();

    // 1) Pick best available per position
    rows.forEach(row => {
      const best = pool.find(p => p.pitchRow === row && !used.has(p.id));
      if (best) { team.push(best); used.add(best.id); }
    });

    // 2) Fill 4th slot with next best remaining
    const extra = pool.find(p => !used.has(p.id));
    if (extra) { team.push(extra); used.add(extra.id); }

    return { team, usedIds: used };
  }

  const { team: team1, usedIds } = pickTeam(scored);
  const remaining = scored.filter(p => !usedIds.has(p.id));
  const { team: team2 } = pickTeam(remaining);

  return [team1, team2];
}
