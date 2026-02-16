/* =======================================
   SCRIPT.JS — Dynamic Dashboard Renderer
   Reads teamsData & playersData from data.js
   Auto-sorts, auto-renders everything.
   ======================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────
     Helper: build a player-row HTML
     ────────────────────────────────────── */
  function buildPlayerRow(player, rank, highlightStat, rowClass = 'player-row') {
    const team = getTeamByName(player.team);
    const teamColor = team ? team.color : '#6366f1';
    const stats = [];

    if (highlightStat === 'goals') {
      stats.push({ val: player.goals, lbl: 'Goals', hl: true });
      stats.push({ val: player.assists, lbl: 'Ast', hl: false });
      stats.push({ val: player.rating.toFixed(1), lbl: 'Rtg', hl: false });
    } else if (highlightStat === 'assists') {
      stats.push({ val: player.goals, lbl: 'Goals', hl: false });
      stats.push({ val: player.assists, lbl: 'Ast', hl: true });
      stats.push({ val: player.rating.toFixed(1), lbl: 'Rtg', hl: false });
    } else if (highlightStat === 'contributions') {
      stats.push({ val: player.goals + player.assists, lbl: 'G+A', hl: true });
      stats.push({ val: player.goals, lbl: 'G', hl: false });
      stats.push({ val: player.assists, lbl: 'A', hl: false });
    } else {
      stats.push({ val: player.rating.toFixed(1), lbl: 'Rtg', hl: true });
      stats.push({ val: player.goals, lbl: 'Goals', hl: false });
      stats.push({ val: player.motm, lbl: 'MOTM', hl: false });
    }

    const rankClass = rank <= 3 ? ` rank-${rank}` : '';
    const statsHTML = stats.map(s =>
      `<div class="player-stat${s.hl ? ' player-stat--highlight' : ''}">
         <div class="player-stat__value">${s.val}</div>
         <div class="player-stat__label">${s.lbl}</div>
       </div>`
    ).join('');

    return `
      <div class="${rowClass}" data-player-id="${player.id}" style="cursor:pointer">
        <div class="player-row__rank${rankClass}">${rank}</div>
        <div class="player-avatar">${getPlayerAvatar(player)}</div>
        <div class="player-info">
          <div class="player-info__name">${player.name}</div>
          <div class="player-info__team">
            <span class="team-dot" style="background:${teamColor}"></span> ${player.team}
          </div>
        </div>
        <div class="player-stats">${statsHTML}</div>
      </div>`;
  }

  /* ──────────────────────────────────────
     Helper: build a TEAM-row HTML (for Defense modal)
     ────────────────────────────────────── */
  function buildTeamRow(team, rank, rowClass = 'player-row') {
    // For defense, we highlight Goals Against (GA)
    // and show Clean Sheets (CS) if we compute them, or just GD
    const stats = [
      { val: team.goalsAgainst, lbl: 'GA', hl: true },
      { val: team.gd > 0 ? '+' + team.gd : team.gd, lbl: 'GD', hl: false },
      { val: team.goalsFor, lbl: 'GF', hl: false }
    ];

    const rankClass = rank <= 3 ? ` rank-${rank}` : '';
    const statsHTML = stats.map(s =>
      `<div class="player-stat${s.hl ? ' player-stat--highlight' : ''}">
         <div class="player-stat__value">${s.val}</div>
         <div class="player-stat__label">${s.lbl}</div>
       </div>`
    ).join('');

    return `
      <div class="${rowClass}" style="cursor:default">
        <div class="player-row__rank${rankClass}">${rank}</div>
        <div class="player-avatar" style="border-radius:4px; border:none; width:auto; height:auto; font-size:1.5rem;">${team.emoji}</div>
        <div class="player-info">
          <div class="player-info__name">${team.name}</div>
          <div class="player-info__team" style="color:${team.color}">Founded ${team.founded}</div>
        </div>
        <div class="player-stats">${statsHTML}</div>
      </div>`;
  }


  /* ═════════════════════════════════════════
     1. TOP SCORERS — auto-sorted by goals
     ═════════════════════════════════════════ */
  const scorersSorted = [...playersData].sort((a, b) => b.goals - a.goals || b.rating - a.rating);
  const scorersContainer = document.getElementById('scorers-list');
  if (scorersContainer) {
    scorersContainer.innerHTML = scorersSorted.slice(0, 3)
      .map((p, i) => buildPlayerRow(p, i + 1, 'goals')).join('');
  }


  /* ═════════════════════════════════════════
     2. TOP ASSISTERS — auto-sorted by assists
     ═════════════════════════════════════════ */
  const assistsSorted = [...playersData].sort((a, b) => b.assists - a.assists || b.rating - a.rating);
  const assistsContainer = document.getElementById('assists-list');
  if (assistsContainer) {
    assistsContainer.innerHTML = assistsSorted.slice(0, 3)
      .map((p, i) => buildPlayerRow(p, i + 1, 'assists')).join('');
  }


  /* ═════════════════════════════════════════
     3. BEST MVP — auto-sorted by rating
     ═════════════════════════════════════════ */
  const mvpSorted = [...playersData].sort((a, b) => b.rating - a.rating || b.motm - a.motm);
  const mvpFeatured = document.getElementById('mvp-featured');
  const mvpStatsBar = document.getElementById('mvp-stats');
  const mvpRunners = document.getElementById('mvp-runners');

  if (mvpFeatured && mvpSorted.length > 0) {
    const mvp = mvpSorted[0];
    const team = getTeamByName(mvp.team);
    const teamColor = team ? team.color : '#6366f1';

    mvpFeatured.innerHTML = `
      <div class="player-avatar" style="position:relative;">
        <span class="mvp-featured__crown">👑</span>
        ${getPlayerAvatar(mvp, 56)}
      </div>
      <div class="player-info" style="flex:1;">
        <div class="player-info__name">${mvp.name}</div>
        <div class="player-info__team">
          <span class="team-dot" style="background:${teamColor}"></span> ${mvp.team}
        </div>
      </div>
      <div style="text-align:center;">
        <div class="mvp-featured__rating">${mvp.rating.toFixed(1)}</div>
        <div class="mvp-featured__rating-label">Rating</div>
      </div>`;
  }

  if (mvpStatsBar && mvpSorted.length > 0) {
    const mvp = mvpSorted[0];
    mvpStatsBar.innerHTML = `
      <div class="player-stat" style="flex:1;">
        <div class="player-stat__value" style="color: var(--accent-gold);">${mvp.goals}</div>
        <div class="player-stat__label">Goals</div>
      </div>
      <div class="player-stat" style="flex:1;">
        <div class="player-stat__value" style="color: var(--accent-green);">${mvp.assists}</div>
        <div class="player-stat__label">Assists</div>
      </div>
      <div class="player-stat" style="flex:1;">
        <div class="player-stat__value" style="color: #a855f7;">${mvp.motm}</div>
        <div class="player-stat__label">MOTM</div>
      </div>
      <div class="player-stat" style="flex:1;">
        <div class="player-stat__value" style="color: var(--accent-blue);">${mvp.rating.toFixed(1)}</div>
        <div class="player-stat__label">Rating</div>
      </div>`;
  }

  if (mvpRunners) {
    mvpRunners.innerHTML = mvpSorted.slice(1, 3).map((p, i) => {
      const t = getTeamByName(p.team);
      const tc = t ? t.color : '#6366f1';
      return `
        <div class="player-row" data-player-id="${p.id}" style="cursor:pointer">
          <div class="player-row__rank rank-${i + 2}">${i + 2}</div>
          <div class="player-avatar">${getPlayerAvatar(p)}</div>
          <div class="player-info">
            <div class="player-info__name">${p.name}</div>
            <div class="player-info__team">
              <span class="team-dot" style="background:${tc}"></span> ${p.team}
            </div>
          </div>
          <div class="player-stats">
            <div class="player-stat">
              <div class="player-stat__value">${p.rating.toFixed(1)}</div>
              <div class="player-stat__label">Rtg</div>
            </div>
          </div>
        </div>`;
    }).join('');
  }


  /* ═════════════════════════════════════════
     4. STANDINGS TABLE — auto-sorted by pts
     ═════════════════════════════════════════ */
  const standingsBody = document.getElementById('standings-body');
  if (standingsBody) {
    const sorted = getSortedStandings();

    standingsBody.innerHTML = sorted.map((team, i) => {
      const pos = i + 1;
      const posClass = pos <= 3 ? ` pos-${pos}` : '';
      const gdSign = team.gd > 0 ? '+' : '';
      const gdClass = team.gd > 0 ? 'gd-positive' : (team.gd < 0 ? 'gd-negative' : 'gd-zero');

      const formDots = team.form.map(r => {
        const cls = r === 'W' ? 'w' : (r === 'D' ? 'd' : 'l');
        return `<span class="form-dot form-dot--${cls}">${r}</span>`;
      }).join('');

      return `
        <tr data-team="${team.name}">
          <td><span class="pos-badge${posClass}">${pos}</span></td>
          <td>
            <div class="team-cell">
              <div class="team-logo team-logo--${team.cssClass}">${team.emoji}</div>
              <div>
                <div class="team-name">${team.name}</div>
                <div class="team-detail">Founded ${team.founded}</div>
              </div>
            </div>
          </td>
          <td>${team.mp}</td>
          <td class="win-cell">${team.wins}</td>
          <td class="draw-cell">${team.draws}</td>
          <td class="loss-cell">${team.losses}</td>
          <td>${team.goalsFor}</td>
          <td>${team.goalsAgainst}</td>
          <td class="${gdClass}">${gdSign}${team.gd}</td>
          <td class="pts-cell">${team.pts}</td>
          <td><div class="form-cell">${formDots}</div></td>
        </tr>`;
    }).join('');
  }


  /* ═════════════════════════════════════════
     5. TEAM MINI-CARDS — auto-rendered
     ═════════════════════════════════════════ */
  const teamStatsRow = document.getElementById('team-stats-row');
  if (teamStatsRow) {
    const sorted = getSortedStandings();
    teamStatsRow.innerHTML = sorted.map(team => `
      <div class="team-mini-card team-mini-card--${team.cssClass}" data-team="${team.name}">
        <div class="team-mini-card__emoji">${team.emoji}</div>
        <div class="team-mini-card__name">${team.name}</div>
        <div class="team-mini-card__stat" style="color: ${team.color};">${team.goalsFor}</div>
        <div class="team-mini-card__stat-label">Goals Scored</div>
      </div>`).join('');
  }


  /* ═════════════════════════════════════════
     6. MODAL LOGIC
     ═════════════════════════════════════════ */
  const modal = document.getElementById('player-modal');
  const modalClose = document.getElementById('modal-close');
  const modalIcon = document.getElementById('modal-icon');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalList = document.getElementById('modal-player-list');

  // Additional sorted lists for snapshot modals
  const csSorted = [...playersData].sort((a, b) => (b.cleanSheets || 0) - (a.cleanSheets || 0) || b.rating - a.rating);
  const motmSorted = [...playersData].sort((a, b) => (b.motm || 0) - (a.motm || 0) || b.rating - a.rating);
  const contribSorted = [...playersData].sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists) || b.rating - a.rating);
  const defenseSorted = getSortedStandings().sort((a, b) => a.goalsAgainst - b.goalsAgainst); // least GA first

  const modalConfig = {
    scorers: { icon: '⚽', title: 'Top Scorers', subtitle: 'All players ranked by goals', data: scorersSorted, highlight: 'goals' },
    assists: { icon: '🅰️', title: 'Top Assisters', subtitle: 'All players ranked by assists', data: assistsSorted, highlight: 'assists' },
    mvp: { icon: '👑', title: 'MVP Rankings', subtitle: 'All players ranked by rating', data: mvpSorted, highlight: 'mvp' },

    // Snapshot modals
    'snapshot-goals': { icon: '⚽', title: 'All Scorers', subtitle: 'Complete goal rankings', data: scorersSorted, highlight: 'goals' },
    'snapshot-rating': { icon: '⭐', title: 'Player Ratings', subtitle: 'All players ranked by rating', data: mvpSorted, highlight: 'mvp' },
    'snapshot-cleansheets': { icon: '🧤', title: 'Clean Sheet Rankings', subtitle: 'All players ranked by clean sheets', data: csSorted, highlight: 'mvp' },
    'snapshot-motm': { icon: '🏅', title: 'MOTM Rankings', subtitle: 'All players ranked by Man of the Match awards', data: motmSorted, highlight: 'mvp' },
    'snapshot-contributions': { icon: '🎯', title: 'Goal Contributions', subtitle: 'Ranked by Goals + Assists', data: contribSorted, highlight: 'contributions' },
    'snapshot-defense': { icon: '🛡️', title: 'Best Defensive Teams', subtitle: 'Ranked by least goals conceded', data: defenseSorted, highlight: 'defense', type: 'team' },
  };

  function openModal(type) {
    const cfg = modalConfig[type];
    if (!cfg) return;

    modalIcon.textContent = cfg.icon;
    modalTitle.textContent = cfg.title;
    modalSubtitle.textContent = cfg.subtitle;

    // Render Team rows vs Player rows
    if (cfg.type === 'team') {
      modalList.innerHTML = cfg.data
        .map((t, i) => buildTeamRow(t, i + 1, 'modal-player-row')).join('');
    } else {
      modalList.innerHTML = cfg.data
        .map((p, i) => buildPlayerRow(p, i + 1, cfg.highlight, 'modal-player-row')).join('');
    }

    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
    animateModalEntrance();
  }

  /* ── Team Lineup Modal ── */
  function openTeamModal(teamName) {
    const team = getTeamByName(teamName);
    if (!team) return;

    const teamPlayers = playersData.filter(p => p.team === teamName);
    // Sort: forwards → midfielders → defenders
    const posOrder = { 'Forward': 1, 'Midfielder': 2, 'Defender': 3 };
    teamPlayers.sort((a, b) => (posOrder[a.position] || 5) - (posOrder[b.position] || 5));

    modalIcon.textContent = team.emoji;
    modalTitle.textContent = team.name;
    modalSubtitle.textContent = `Lineup · ${teamPlayers.length} Players`;

    modalList.innerHTML = teamPlayers.map((p, i) => {
      return `
              <div class="modal-player-row" data-player-id="${p.id}" style="cursor:pointer">
                <div class="player-row__rank" style="background:${team.color};color:#fff;">${i + 1}</div>
                <div class="player-avatar">${getPlayerAvatar(p)}</div>
                <div class="player-info">
                  <div class="player-info__name">${p.name}</div>
                  <div class="player-info__team" style="color:${team.color};font-weight:600;">${p.position}</div>
                </div>
                <div class="player-stats">
                  <div class="player-stat">
                    <div class="player-stat__value">${p.goals}</div>
                    <div class="player-stat__label">Goals</div>
                  </div>
                  <div class="player-stat">
                    <div class="player-stat__value">${p.assists}</div>
                    <div class="player-stat__label">Ast</div>
                  </div>
                  <div class="player-stat">
                    <div class="player-stat__value">${p.rating.toFixed(1)}</div>
                    <div class="player-stat__label">Rtg</div>
                  </div>
                </div>
              </div>`;
    }).join('');

    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
    animateModalEntrance();
  }

  function animateModalEntrance() {
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.modal-content',
        { y: 30, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out' });
      gsap.fromTo('.modal-player-row',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out', delay: 0.15 });
    }
  }

  function closeModal() {
    modal.classList.remove('modal--open');
    document.body.style.overflow = '';
  }

  // Stat card clicks → open stat modal
  document.querySelectorAll('.stat-card[data-modal]').forEach(card => {
    card.addEventListener('click', () => openModal(card.getAttribute('data-modal')));
  });

  // Snapshot card clicks → open full list modal
  document.querySelectorAll('.snapshot-card[id]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on a player highlight (that navigates to profile)
      if (e.target.closest('.snapshot-highlight')) return;
      openModal(card.id);
    });
  });

  // Team clicks → open team lineup modal (standings rows + mini-cards)
  document.addEventListener('click', e => {
    // Standings table row
    const tr = e.target.closest('tr[data-team]');
    if (tr) { e.stopPropagation(); openTeamModal(tr.getAttribute('data-team')); return; }
    // Team mini-card
    const mc = e.target.closest('.team-mini-card[data-team]');
    if (mc) { e.stopPropagation(); openTeamModal(mc.getAttribute('data-team')); return; }
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });


  /* ═════════════════════════════════════════
     7. NAVIGATE TO PLAYER PROFILE
     ═════════════════════════════════════════ */
  document.addEventListener('click', e => {
    // Don't navigate if clicking inside the modal (players are clickable in modal too)
    const row = e.target.closest('[data-player-id]');
    if (row) {
      // If inside an open modal, close it first then navigate
      if (modal && modal.classList.contains('modal--open')) {
        closeModal();
      }
      window.location.href = `player.html?id=${row.getAttribute('data-player-id')}`;
    }
  });


  /* ═════════════════════════════════════════
     8. 3D TILT EFFECT
     ═════════════════════════════════════════ */
  document.querySelectorAll('.card-3d').forEach(card => {
    const maxTilt = parseFloat(card.getAttribute('data-tilt-max') || 4);
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          rotateX: (y - 0.5) * -maxTilt, rotateY: (x - 0.5) * maxTilt,
          scale: 1.015, duration: 0.5, ease: 'power2.out', transformPerspective: 1200
        });
      }
    });
    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      }
    });
  });


  /* ═════════════════════════════════════════
     TOURNAMENT SNAPSHOT — auto-computed
     ═════════════════════════════════════════ */
  (function renderSnapshot() {
    const standings = getSortedStandings();
    const totalGoals = standings.reduce((s, t) => s + t.goalsFor, 0);
    const totalMatches = standings.reduce((s, t) => s + t.mp, 0);
    // Each match is between 2 teams, so unique matches = totalMatches / 2
    const uniqueMatches = Math.max(1, totalMatches / 2);
    const avgGoalsPerMatch = (totalGoals / uniqueMatches).toFixed(1);

    // Helper to build featured player highlight
    function buildHighlight(player, statVal, statColor) {
      const team = getTeamByName(player.team);
      const tc = team ? team.color : '#6366f1';
      return `
        <div class="snapshot-highlight" data-player-id="${player.id}" style="cursor:pointer">
          <div class="snapshot-highlight__avatar">${getPlayerAvatar(player, 36)}</div>
          <div class="snapshot-highlight__info">
            <div class="snapshot-highlight__name">${player.name}</div>
            <div class="snapshot-highlight__team">
              <span class="team-dot" style="background:${tc}"></span> ${player.team}
            </div>
          </div>
          <div class="snapshot-highlight__stat" style="color:${statColor}">${statVal}</div>
        </div>`;
    }

    // 1) TOTAL GOALS
    const topScorer = [...playersData].sort((a, b) => b.goals - a.goals)[0];
    const goalsEl = document.getElementById('snapshot-goals');
    if (goalsEl) {
      const bestAttack = standings.reduce((best, t) => t.goalsFor > best.goalsFor ? t : best, standings[0]);
      goalsEl.innerHTML = `
        <div class="snapshot-card__top">
          <div class="snapshot-card__icon snapshot-card__icon--goals">⚽</div>
          <span class="snapshot-card__badge">${avgGoalsPerMatch} per match</span>
        </div>
        <div class="snapshot-card__value snapshot-card__value--goals">${totalGoals}</div>
        <div class="snapshot-card__label">Total Goals Scored</div>
        <div class="snapshot-card__divider"></div>
        ${buildHighlight(topScorer, topScorer.goals + ' ⚽', '#d97706')}
        <div class="snapshot-substats">
          ${standings.map(t => `
            <div class="snapshot-substat">
              <div class="snapshot-substat__value" style="color:${t.color}">${t.goalsFor}</div>
              <div class="snapshot-substat__label">${t.emoji} GF</div>
            </div>`).join('')}
        </div>`;
    }

    // 2) TOP RATED XI
    const avgRating = (playersData.reduce((s, p) => s + p.rating, 0) / playersData.length).toFixed(1);
    const topRated = [...playersData].sort((a, b) => b.rating - a.rating)[0];
    const ratingEl = document.getElementById('snapshot-rating');
    if (ratingEl) {
      const above7 = playersData.filter(p => p.rating >= 7.0).length;
      ratingEl.innerHTML = `
        <div class="snapshot-card__top">
          <div class="snapshot-card__icon snapshot-card__icon--rating">⭐</div>
          <span class="snapshot-card__badge">${above7} players ≥ 7.0</span>
        </div>
        <div class="snapshot-card__value snapshot-card__value--rating">${avgRating}</div>
        <div class="snapshot-card__label">Avg Player Rating</div>
        <div class="snapshot-card__divider"></div>
        ${buildHighlight(topRated, topRated.rating.toFixed(1) + ' ★', '#8b5cf6')}
        <div class="snapshot-substats">
          <div class="snapshot-substat">
            <div class="snapshot-substat__value">${[...playersData].sort((a, b) => b.rating - a.rating)[0].rating.toFixed(1)}</div>
            <div class="snapshot-substat__label">Highest</div>
          </div>
          <div class="snapshot-substat">
            <div class="snapshot-substat__value">${[...playersData].sort((a, b) => a.rating - b.rating)[0].rating.toFixed(1)}</div>
            <div class="snapshot-substat__label">Lowest</div>
          </div>
          <div class="snapshot-substat">
            <div class="snapshot-substat__value">${playersData.length}</div>
            <div class="snapshot-substat__label">Players</div>
          </div>
        </div>`;
    }

    // 3) CLEAN SHEET KINGS
    const totalCS = playersData.reduce((s, p) => s + (p.cleanSheets || 0), 0);
    const csLeader = [...playersData].sort((a, b) => (b.cleanSheets || 0) - (a.cleanSheets || 0))[0];
    const csEl = document.getElementById('snapshot-cleansheets');
    if (csEl) {
      const defenders = playersData.filter(p => p.position === 'Defender');
      const avgDefRating = (defenders.reduce((s, p) => s + p.rating, 0) / defenders.length).toFixed(1);
      csEl.innerHTML = `
        <div class="snapshot-card__top">
          <div class="snapshot-card__icon snapshot-card__icon--cleansheet">🧤</div>
          <span class="snapshot-card__badge">${defenders.length} defenders</span>
        </div>
        <div class="snapshot-card__value snapshot-card__value--cleansheet">${totalCS}</div>
        <div class="snapshot-card__label">Total Clean Sheets</div>
        <div class="snapshot-card__divider"></div>
        ${buildHighlight(csLeader, (csLeader.cleanSheets || 0) + ' 🧤', '#059669')}
        <div class="snapshot-substats">
          <div class="snapshot-substat">
            <div class="snapshot-substat__value" style="color:var(--accent-emerald)">${avgDefRating}</div>
            <div class="snapshot-substat__label">Def Avg Rtg</div>
          </div>
          ${standings.map(t => {
        const teamCS = playersData.filter(p => p.team === t.name).reduce((s, p) => s + (p.cleanSheets || 0), 0);
        return `<div class="snapshot-substat">
              <div class="snapshot-substat__value" style="color:${t.color}">${teamCS}</div>
              <div class="snapshot-substat__label">${t.emoji} CS</div>
            </div>`;
      }).join('')}
        </div>`;
    }

    // 4) MOTM AWARDS
    const totalMOTM = playersData.reduce((s, p) => s + (p.motm || 0), 0);
    const motmLeader = [...playersData].sort((a, b) => (b.motm || 0) - (a.motm || 0))[0];
    const motmEl = document.getElementById('snapshot-motm');
    if (motmEl) {
      const motmPlayers = playersData.filter(p => (p.motm || 0) > 0).length;
      motmEl.innerHTML = `
        <div class="snapshot-card__top">
          <div class="snapshot-card__icon snapshot-card__icon--motm">🏅</div>
          <span class="snapshot-card__badge">${motmPlayers} winners</span>
        </div>
        <div class="snapshot-card__value snapshot-card__value--motm">${totalMOTM}</div>
        <div class="snapshot-card__label">MOTM Awards Given</div>
        <div class="snapshot-card__divider"></div>
        ${buildHighlight(motmLeader, (motmLeader.motm || 0) + ' 🏅', '#f59e0b')}
        <div class="snapshot-substats">
          ${standings.map(t => {
        const teamMOTM = playersData.filter(p => p.team === t.name).reduce((s, p) => s + (p.motm || 0), 0);
        return `<div class="snapshot-substat">
              <div class="snapshot-substat__value" style="color:${t.color}">${teamMOTM}</div>
              <div class="snapshot-substat__label">${t.emoji} MOTM</div>
            </div>`;
      }).join('')}
        </div>`;
    }
  })();


  /* ═════════════════════════════════════════
     TRANSFER WINDOW — weekly player swap
     ═════════════════════════════════════════ */
  (function renderTransferWindow() {
    const container = document.getElementById('transfer-content');
    if (!container) return;

    const standings = getSortedStandings();
    if (standings.length < 2) return;

    // Best team = most pts (first in sorted), Worst team = least pts (last)
    const bestTeam = standings[0];
    const worstTeam = standings[standings.length - 1];

    // Find worst-rated player on each team
    const bestTeamPlayers = playersData.filter(p => p.team === bestTeam.name);
    const worstTeamPlayers = playersData.filter(p => p.team === worstTeam.name);

    const worstOfBest = [...bestTeamPlayers].sort((a, b) => a.rating - b.rating)[0];
    const worstOfWorst = [...worstTeamPlayers].sort((a, b) => a.rating - b.rating)[0];

    if (!worstOfBest || !worstOfWorst) return;

    // Compute next Sunday 12:00 PM for countdown
    function getNextSundayNoon() {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      let daysUntilSunday = (7 - day) % 7;
      // If it's Sunday but past noon, next Sunday
      if (daysUntilSunday === 0 && now.getHours() >= 12) {
        daysUntilSunday = 7;
      }
      const next = new Date(now);
      next.setDate(now.getDate() + daysUntilSunday);
      next.setHours(12, 0, 0, 0);
      return next;
    }

    function formatCountdown(ms) {
      if (ms <= 0) return '00:00:00';
      const totalSec = Math.floor(ms / 1000);
      const d = Math.floor(totalSec / 86400);
      const h = Math.floor((totalSec % 86400) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const pad = n => String(n).padStart(2, '0');
      if (d > 0) return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    // Helper to build transfer player row
    function buildTransferPlayer(player, direction, targetTeam) {
      const team = getTeamByName(player.team);
      const targetTeamData = getTeamByName(targetTeam);
      const tc = team ? team.color : '#6366f1';
      const ttc = targetTeamData ? targetTeamData.color : '#6366f1';
      const dirClass = direction === 'out' ? 'transfer-player--out' : 'transfer-player--in';
      const arrow = direction === 'out' ? '→' : '←';

      return `
        <div class="transfer-player ${dirClass}" data-player-id="${player.id}" style="cursor:pointer">
          <div class="transfer-player__avatar">${getPlayerAvatar(player, 44)}</div>
          <div class="transfer-player__info">
            <div class="transfer-player__name">${player.name}</div>
            <div class="transfer-player__detail">
              <span class="team-dot" style="background:${tc}"></span> ${player.team}
              <span style="margin:0 3px;color:var(--text-muted)">${arrow}</span>
              <span class="team-dot" style="background:${ttc}"></span> ${targetTeam}
            </div>
          </div>
          <div class="transfer-player__rating" style="color:${direction === 'out' ? 'var(--accent-red)' : 'var(--accent-emerald)'}">${player.rating.toFixed(1)}</div>
        </div>`;
    }

    container.innerHTML = `
      <div class="transfer-swap">
        <div class="transfer-label transfer-label--out">↑ Leaving ${worstTeam.name}</div>
        ${buildTransferPlayer(worstOfWorst, 'out', bestTeam.name)}

        <div class="transfer-direction">
          <div class="transfer-direction__line"></div>
          <div class="transfer-direction__icon">⇅</div>
          <div class="transfer-direction__line"></div>
        </div>

        <div class="transfer-label transfer-label--in">↓ Leaving ${bestTeam.name}</div>
        ${buildTransferPlayer(worstOfBest, 'in', worstTeam.name)}
      </div>

      <div class="transfer-countdown">
        <div class="transfer-countdown__dot"></div>
        <div class="transfer-countdown__text">Next transfer in</div>
        <div class="transfer-countdown__timer" id="transfer-timer">--:--:--</div>
      </div>`;

    // Live countdown
    const timerEl = document.getElementById('transfer-timer');
    function updateTimer() {
      const nextSunday = getNextSundayNoon();
      const remaining = nextSunday.getTime() - Date.now();
      if (timerEl) {
        timerEl.textContent = formatCountdown(remaining);
      }
      // If time is up, reload to get fresh transfer
      if (remaining <= 0) {
        window.location.reload();
        return;
      }
    }
    updateTimer();
    setInterval(updateTimer, 1000);
  })();

  /* ═════════════════════════════════════════
     BEST XI — RENDER PITCH CARDS
     ═════════════════════════════════════════ */
  if (typeof getBestTeams === 'function') {
    const [team1, team2] = getBestTeams();

    function buildPitchPlayer(player) {
      const team = getTeamByName(player.team);
      const teamColor = team ? team.color : '#6366f1';
      const avatar = getPlayerAvatar(player, 50);
      const lastName = player.name.split(' ').pop();

      return `
            <div class="pitch-player" data-player-id="${player.id}">
              <div class="pitch-player__avatar" style="border-color:${teamColor}">
                ${avatar}
                <span class="pitch-player__team-dot" style="background:${teamColor}"></span>
              </div>
              <div class="pitch-player__name">${lastName}</div>
              <div class="pitch-player__stats">
                <span class="pitch-player__stat-badge pitch-player__stat-badge--goals">⚽${player.goals}</span>
                <span class="pitch-player__stat-badge pitch-player__stat-badge--assists">🅰️${player.assists}</span>
                <span class="pitch-player__stat-badge pitch-player__stat-badge--rating">⭐${player.rating.toFixed(1)}</span>
              </div>
            </div>`;
    }

    function renderTeam(cardId, players) {
      const card = document.getElementById(cardId);
      if (!card) return;
      const rows = card.querySelectorAll('.pitch__row');
      rows.forEach(row => {
        const rowName = row.getAttribute('data-row');
        const rowPlayers = players.filter(p => p.pitchRow === rowName);
        rowPlayers.forEach(player => {
          row.insertAdjacentHTML('beforeend', buildPitchPlayer(player));
        });
      });
    }

    renderTeam('best-xi-card-1', team1);
    renderTeam('best-xi-card-2', team2);
  }


  /* ═════════════════════════════════════════
     9. GSAP ENTRANCE ANIMATIONS
     ═════════════════════════════════════════ */
  if (typeof gsap !== 'undefined') {
    gsap.from('.header', { y: -30, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('.stat-card', { y: 40, opacity: 0, scale: 0.95, duration: 0.7, stagger: 0.15, ease: 'expo.out', delay: 0.3 });
    gsap.from('.standings-card', { y: 50, opacity: 0, scale: 0.96, duration: 0.8, ease: 'expo.out', delay: 0.6 });
    gsap.from('.transfer-card', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.8 });
    gsap.from('.team-mini-card', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', delay: 0.9 });

    // Best XI & Snapshot entrance
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Snapshot section
      gsap.from('.snapshot-header', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.tournament-snapshot', start: 'top 85%' }
      });
      gsap.from('.snapshot-card', {
        y: 40, opacity: 0, scale: 0.95, duration: 0.7, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.snapshot-grid', start: 'top 82%' }
      });

      gsap.from('.best-xi-header', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.best-xi-section', start: 'top 85%' }
      });
      gsap.from('.best-xi-card', {
        y: 60, opacity: 0, scale: 0.94, duration: 1, stagger: 0.2, ease: 'expo.out',
        scrollTrigger: { trigger: '.best-xi-grid', start: 'top 80%' }
      });
      gsap.from('.pitch-player', {
        y: 20, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: '.best-xi-grid', start: 'top 70%' }
      });
    } else {
      gsap.from('.snapshot-header', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 1.0 });
      gsap.from('.snapshot-card', { y: 40, opacity: 0, scale: 0.95, duration: 0.7, stagger: 0.12, ease: 'expo.out', delay: 1.1 });
      gsap.from('.best-xi-header', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 1.4 });
      gsap.from('.best-xi-card', { y: 60, opacity: 0, scale: 0.94, duration: 1, stagger: 0.2, ease: 'expo.out', delay: 1.6 });
      gsap.from('.pitch-player', { y: 20, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', delay: 1.9 });
    }
  }


  /* ═════════════════════════════════════════
     ADDITIONAL SNAPSHOT STATS
     ═════════════════════════════════════════ */
  (function renderExtraSnapshots() {
    const standings = getSortedStandings();

    // Helper to build featured player highlight (reusable)
    function buildHighlight(player, statVal, statColor) {
      const team = getTeamByName(player.team);
      const tc = team ? team.color : '#6366f1';
      return `
        <div class="snapshot-highlight" data-player-id="${player.id}" style="cursor:pointer">
          <div class="snapshot-highlight__avatar">${getPlayerAvatar(player, 36)}</div>
          <div class="snapshot-highlight__info">
            <div class="snapshot-highlight__name">${player.name}</div>
            <div class="snapshot-highlight__team">
              <span class="team-dot" style="background:${tc}"></span> ${player.team}
            </div>
          </div>
          <div class="snapshot-highlight__stat" style="color:${statColor}">${statVal}</div>
        </div>`;
    }

    // 5) GOAL CONTRIBUTIONS (goals + assists)
    const contribSorted = [...playersData].sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists));
    const contribLeader = contribSorted[0];
    const totalContributions = playersData.reduce((s, p) => s + p.goals + p.assists, 0);
    const contribEl = document.getElementById('snapshot-contributions');
    if (contribEl) {
      const avgContrib = (totalContributions / playersData.length).toFixed(1);
      contribEl.innerHTML = `
        <div class="snapshot-card__top">
          <div class="snapshot-card__icon snapshot-card__icon--goals">🎯</div>
          <span class="snapshot-card__badge">${avgContrib} avg per player</span>
        </div>
        <div class="snapshot-card__value snapshot-card__value--goals">${totalContributions}</div>
        <div class="snapshot-card__label">Goal Contributions (G+A)</div>
        <div class="snapshot-card__divider"></div>
        ${buildHighlight(contribLeader, (contribLeader.goals + contribLeader.assists) + ' G+A', '#8b5cf6')}
        <div class="snapshot-substats">
          ${standings.map(t => {
        const teamContrib = playersData.filter(p => p.team === t.name).reduce((s, p) => s + p.goals + p.assists, 0);
        return `<div class="snapshot-substat">
              <div class="snapshot-substat__value" style="color:${t.color}">${teamContrib}</div>
              <div class="snapshot-substat__label">${t.emoji} G+A</div>
            </div>`;
      }).join('')}
        </div>`;
    }

    // 6) DEFENSIVE RECORD (least goals conceded)
    const bestDefense = [...standings].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
    const worstDefense = [...standings].sort((a, b) => b.goalsAgainst - a.goalsAgainst)[0];
    const defEl = document.getElementById('snapshot-defense');
    if (defEl) {
      defEl.innerHTML = `
        <div class="snapshot-card__top">
          <div class="snapshot-card__icon snapshot-card__icon--cleansheet">🛡️</div>
          <span class="snapshot-card__badge">${bestDefense.emoji} ${bestDefense.name}</span>
        </div>
        <div class="snapshot-card__value snapshot-card__value--cleansheet">${bestDefense.goalsAgainst}</div>
        <div class="snapshot-card__label">Best Defense (Goals Conceded)</div>
        <div class="snapshot-card__divider"></div>
        <div class="snapshot-substats">
          ${standings.map(t => {
        const gdSign = t.gd > 0 ? '+' : '';
        return `<div class="snapshot-substat">
              <div class="snapshot-substat__value" style="color:${t.color}">${t.goalsAgainst}</div>
              <div class="snapshot-substat__label">${t.emoji} GA</div>
            </div>
            <div class="snapshot-substat">
              <div class="snapshot-substat__value" style="color:${t.gd >= 0 ? '#10b981' : '#ef4444'}">${gdSign}${t.gd}</div>
              <div class="snapshot-substat__label">${t.emoji} GD</div>
            </div>`;
      }).join('')}
        </div>`;
    }
  })();


  /* ═════════════════════════════════════════
     AWARDS — BALLON D'OR & WOODEN SPOON VOTING
     (Firebase Realtime Database powered)
     ═════════════════════════════════════════ */
  (function renderAwards() {
    if (typeof TOURNAMENT_CONFIG === 'undefined') return;

    const now = new Date();
    const votingStart = new Date(TOURNAMENT_CONFIG.votingStartDate);
    const resultsDate = new Date(TOURNAMENT_CONFIG.resultsDate);

    // Determine current phase
    const phase = now >= resultsDate ? 'results' : (now >= votingStart ? 'voting' : 'locked');

    // Firebase-friendly keys (no dots/brackets)
    const BALLON_KEY = 'rsl_ballon_dor_vote';
    const SPOON_KEY = 'rsl_wooden_spoon_vote';

    // Stat-based fallback winners
    const bestPlayer = [...playersData].sort((a, b) => b.rating - a.rating || (b.goals + b.assists) - (a.goals + a.assists))[0];
    const worstPlayer = [...playersData].sort((a, b) => a.rating - b.rating || (a.goals + a.assists) - (b.goals + b.assists))[0];

    // Device ID for one-vote-per-device
    const deviceId = getDeviceId();

    // Countdown formatter
    function formatCountdown(ms) {
      if (ms <= 0) return '00:00:00';
      const totalSec = Math.floor(ms / 1000);
      const d = Math.floor(totalSec / 86400);
      const h = Math.floor((totalSec % 86400) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const pad = n => String(n).padStart(2, '0');
      if (d > 0) return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    // Build status bar HTML
    function buildStatusBar(statusElId, targetDate, statusText, dotClass) {
      const statusEl = document.getElementById(statusElId);
      if (!statusEl) return;
      statusEl.innerHTML = `
        <div class="award-status__dot ${dotClass}"></div>
        <div class="award-status__text">${statusText}</div>
        <div class="award-status__timer" id="${statusElId}-timer"></div>`;

      // Start countdown
      const timerEl = document.getElementById(`${statusElId}-timer`);
      function tick() {
        const remaining = targetDate.getTime() - Date.now();
        if (timerEl) timerEl.textContent = formatCountdown(remaining);
        if (remaining <= 0) {
          window.location.reload();
          return;
        }
      }
      tick();
      setInterval(tick, 1000);
    }

    // Build a vote player row (with live count placeholder)
    function buildVoteRow(player, awardKey) {
      const team = getTeamByName(player.team);
      const tc = team ? team.color : '#6366f1';
      const currentVote = localStorage.getItem(awardKey);
      const isVoted = currentVote === String(player.id);
      const hasVoted = currentVote !== null;
      const btnClass = isVoted ? 'vote-btn vote-btn--voted' : (hasVoted ? 'vote-btn vote-btn--disabled' : 'vote-btn');
      const btnText = isVoted ? '✓ Voted' : 'Vote';

      return `
        <div class="vote-player-row" data-vote-player-id="${player.id}">
          <div class="vote-bar" data-vote-bar="${player.id}"></div>
          <div class="player-avatar">${getPlayerAvatar(player, 40)}</div>
          <div class="player-info">
            <div class="player-info__name">${player.name}</div>
            <div class="player-info__team">
              <span class="team-dot" style="background:${tc}"></span> ${player.team} · ${player.position}
            </div>
            <div class="player-info__meta">⚽${player.goals} 🅰️${player.assists} ⭐${player.rating.toFixed(1)}</div>
          </div>
          <div class="vote-count" data-vote-count="${player.id}">0</div>
          <button class="${btnClass}" data-award="${awardKey}" data-player-id="${player.id}" ${hasVoted ? 'disabled' : ''}>
            <span>${btnText}</span>
          </button>
        </div>`;
    }

    // Build results HTML for a winner (Firebase vote-based)
    function buildResultHTML(winner, voteCount, totalVotes, awardKey, crownEmoji) {
      const team = getTeamByName(winner.team);
      const tc = team ? team.color : '#6366f1';
      const userVote = localStorage.getItem(awardKey);
      const votedPlayer = userVote ? playersData.find(p => p.id === parseInt(userVote)) : null;
      const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

      let userVoteHTML = '';
      if (votedPlayer) {
        const isCorrect = votedPlayer.id === winner.id;
        userVoteHTML = `
          <div class="award-result__your-vote">
            Your vote: <strong>${votedPlayer.name}</strong> ${isCorrect ? '✅ Correct pick!' : ''}
          </div>`;
      }

      return `
        <div class="award-result">
          <div class="award-result__crown">${crownEmoji}</div>
          <div class="award-result__avatar">${getPlayerAvatar(winner, 80)}</div>
          <div class="award-result__name">${winner.name}</div>
          <div class="award-result__team">
            <span class="team-dot" style="background:${tc}"></span> ${winner.team} · ${winner.position}
          </div>
          <div class="award-result__vote-summary">
            <span class="award-result__vote-count">${voteCount} vote${voteCount !== 1 ? 's' : ''}</span>
            <span class="award-result__vote-pct">${pct}%</span>
            <span class="award-result__vote-total">of ${totalVotes} total</span>
          </div>
          <div class="award-result__stats">
            <div class="award-result__stat">
              <div class="award-result__stat-value">${winner.goals}</div>
              <div class="award-result__stat-label">Goals</div>
            </div>
            <div class="award-result__stat">
              <div class="award-result__stat-value">${winner.assists}</div>
              <div class="award-result__stat-label">Assists</div>
            </div>
            <div class="award-result__stat">
              <div class="award-result__stat-value">${winner.rating.toFixed(1)}</div>
              <div class="award-result__stat-label">Rating</div>
            </div>
            <div class="award-result__stat">
              <div class="award-result__stat-value">${winner.motm}</div>
              <div class="award-result__stat-label">MOTM</div>
            </div>
          </div>
          ${userVoteHTML}
        </div>`;
    }

    // ── Update live counts on vote rows ──
    function updateVoteCounts(bodyElId, counts, total) {
      const body = document.getElementById(bodyElId);
      if (!body) return;
      const maxCount = Math.max(1, ...Object.values(counts));
      body.querySelectorAll('.vote-player-row').forEach(row => {
        const pid = row.getAttribute('data-vote-player-id');
        const count = counts[pid] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const barPct = Math.round((count / maxCount) * 100);
        // Update count badge
        const countEl = row.querySelector(`[data-vote-count="${pid}"]`);
        if (countEl) countEl.textContent = count;
        // Update bar width
        const barEl = row.querySelector(`[data-vote-bar="${pid}"]`);
        if (barEl) barEl.style.width = `${barPct}%`;
        // Highlight leader
        if (count === maxCount && count > 0) {
          row.classList.add('vote-player-row--leader');
        } else {
          row.classList.remove('vote-player-row--leader');
        }
      });
    }

    // ── Render based on phase ──

    if (phase === 'locked') {
      // Ballon d'Or locked
      buildStatusBar('ballon-dor-status', votingStart, 'Voting opens in', 'award-status__dot--locked');
      const bdBody = document.getElementById('ballon-dor-body');
      if (bdBody) {
        bdBody.innerHTML = `
          <div class="award-locked">
            <div class="award-locked__icon">🔒</div>
            <div class="award-locked__text">Voting for Ballon d'Or opens during the last week of Ramadan. Come back to cast your vote!</div>
          </div>`;
      }

      // Wooden Spoon locked
      buildStatusBar('wooden-spoon-status', votingStart, 'Voting opens in', 'award-status__dot--locked');
      const wsBody = document.getElementById('wooden-spoon-body');
      if (wsBody) {
        wsBody.innerHTML = `
          <div class="award-locked">
            <div class="award-locked__icon">🔒</div>
            <div class="award-locked__text">Voting for Wooden Spoon opens during the last week of Ramadan. Come back to cast your vote!</div>
          </div>`;
      }
    }

    else if (phase === 'voting') {
      // Sort players for voting — by rating desc for ballon d'or
      const bdSorted = [...playersData].sort((a, b) => b.rating - a.rating);
      // Sort by rating asc for wooden spoon
      const wsSorted = [...playersData].sort((a, b) => a.rating - b.rating);

      // Ballon d'Or voting
      buildStatusBar('ballon-dor-status', resultsDate, 'Voting ends in', 'award-status__dot--voting');
      const bdBody = document.getElementById('ballon-dor-body');
      if (bdBody) {
        bdBody.innerHTML = bdSorted.map(p => buildVoteRow(p, BALLON_KEY)).join('');
      }

      // Wooden Spoon voting
      buildStatusBar('wooden-spoon-status', resultsDate, 'Voting ends in', 'award-status__dot--voting');
      const wsBody = document.getElementById('wooden-spoon-body');
      if (wsBody) {
        wsBody.innerHTML = wsSorted.map(p => buildVoteRow(p, SPOON_KEY)).join('');
      }

      // Subscribe to real-time vote counts
      listenVoteCounts(BALLON_KEY, (counts, total) => updateVoteCounts('ballon-dor-body', counts, total));
      listenVoteCounts(SPOON_KEY, (counts, total) => updateVoteCounts('wooden-spoon-body', counts, total));

      // Handle vote clicks → write to Firebase
      document.addEventListener('click', e => {
        const btn = e.target.closest('.vote-btn');
        if (!btn || btn.classList.contains('vote-btn--voted') || btn.classList.contains('vote-btn--disabled')) return;

        const awardKey = btn.getAttribute('data-award');
        const playerId = btn.getAttribute('data-player-id');
        if (!awardKey || !playerId) return;

        // Optimistic UI update
        btn.classList.add('vote-btn--voted', 'vote-btn--just-voted');
        btn.querySelector('span').textContent = '✓ Voted';
        btn.disabled = true;

        // Disable all other buttons for this award
        document.querySelectorAll(`.vote-btn[data-award="${awardKey}"]`).forEach(otherBtn => {
          if (otherBtn !== btn) {
            otherBtn.classList.add('vote-btn--disabled');
            otherBtn.disabled = true;
          }
        });

        // Save to localStorage (for persistence on reload)
        localStorage.setItem(awardKey, playerId);

        // Write to Firebase
        castVote(awardKey, playerId).catch(err => {
          console.warn('Vote write failed:', err);
        });
      });
    }

    else if (phase === 'results') {
      // Listen to Firebase for final tallies, then render winner
      function renderResults(awardKey, statusElId, bodyElId, crownEmoji, statFallback) {
        const statusEl = document.getElementById(statusElId);
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="award-status__dot award-status__dot--results"></div>
            <div class="award-status__text">${crownEmoji} Winner Announced!</div>`;
        }

        // One-time read to determine winner
        if (firebaseDB) {
          firebaseDB.ref(`votes/${awardKey}`).once('value').then(snapshot => {
            const counts = {};
            let total = 0;
            snapshot.forEach(child => {
              const pid = child.val().playerId;
              counts[pid] = (counts[pid] || 0) + 1;
              total++;
            });

            // Find player with most votes
            let winnerId = null;
            let maxVotes = 0;
            for (const [pid, c] of Object.entries(counts)) {
              if (c > maxVotes) { maxVotes = c; winnerId = parseInt(pid); }
            }

            const winner = winnerId ? playersData.find(p => p.id === winnerId) : statFallback;
            const winnerVotes = winnerId ? maxVotes : 0;

            const body = document.getElementById(bodyElId);
            if (body) {
              body.innerHTML = buildResultHTML(winner || statFallback, winnerVotes, total, awardKey, crownEmoji);
            }
          }).catch(() => {
            // Fallback to stat-based winner
            const body = document.getElementById(bodyElId);
            if (body) body.innerHTML = buildResultHTML(statFallback, 0, 0, awardKey, crownEmoji);
          });
        } else {
          // No Firebase — fallback
          const body = document.getElementById(bodyElId);
          if (body) body.innerHTML = buildResultHTML(statFallback, 0, 0, awardKey, crownEmoji);
        }
      }

      renderResults(BALLON_KEY, 'ballon-dor-status', 'ballon-dor-body', '👑', bestPlayer);
      renderResults(SPOON_KEY, 'wooden-spoon-status', 'wooden-spoon-body', '🥄', worstPlayer);
    }
  })();


  /* ═════════════════════════════════════════
     AWARDS — GSAP ENTRANCE ANIMATIONS
     ═════════════════════════════════════════ */
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.from('.awards-header', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.awards-section', start: 'top 85%' }
      });
      gsap.from('.award-card', {
        y: 50, opacity: 0, scale: 0.95, duration: 0.8, stagger: 0.15, ease: 'expo.out',
        scrollTrigger: { trigger: '.awards-grid', start: 'top 80%' }
      });
    } else {
      gsap.from('.awards-header', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 2.2 });
      gsap.from('.award-card', { y: 50, opacity: 0, scale: 0.95, duration: 0.8, stagger: 0.15, ease: 'expo.out', delay: 2.4 });
    }
  }


  /* ═════════════════════════════════════════
     10. LENIS SMOOTH SCROLL
     ═════════════════════════════════════════ */
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis();
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

});
