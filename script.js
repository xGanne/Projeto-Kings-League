const teams = [
    { id: 1, name: 'Capim FC', logo: 'capimfc.png', color: '#66bb6a' },
    { id: 2, name: 'Dendele FC', logo: 'dendelefc.png', color: '#ffb300' },
    { id: 3, name: 'Desimpedidos Goti', logo: 'desimpedidosgoti.png', color: '#5e35b1' },
    { id: 4, name: 'FC Real Elite', logo: 'fcrealelite.png', color: '#29b6f6' },
    { id: 5, name: 'Fluxo FC', logo: 'fluxofc.png', color: '#ff7043' },
    { id: 6, name: 'Funkbol Clube', logo: 'funkbolclube.png', color: '#ab47bc' },
    { id: 7, name: 'Furia FC', logo: 'furiafc.png', color: '#d32f2f' },
    { id: 8, name: 'G3X FC', logo: 'g3xfc.png', color: '#fdd835' },
    { id: 9, name: 'LOUD SC', logo: 'loudsc.png', color: '#00c853' },
    { id: 10, name: 'Nyvelados FC', logo: 'nyveladosfc.png', color: '#757575' }
];

// Estado do campeonato
let championship = {
    currentRound: 1,
    totalRounds: 18,
    teams: teams.map(team => ({
        ...team,
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0
    })),
    matches: [],
    currentRoundView: 1,
    isFinished: false
};

// Gerar todas as partidas do campeonato
function generateAllMatches() {
    championship.matches = [];
    const totalTeams = teams.length;
    
    let tempTeams = [...teams];
    if (tempTeams.length % 2 !== 0) {
        tempTeams.push({ id: 0, name: 'BYE', logo: 'placeholder.png', color: '#000000' });
    }
    const numTeams = tempTeams.length;
    const roundsPerHalf = numTeams - 1;
    const totalRoundsToGenerate = roundsPerHalf * 2;

    for (let r = 0; r < totalRoundsToGenerate; r++) {
        const roundMatches = [];
        for (let i = 0; i < numTeams / 2; i++) {
            const homeIndex = i;
            const awayIndex = numTeams - 1 - i;

            if (tempTeams[homeIndex].id !== 0 && tempTeams[awayIndex].id !== 0) {
                let homeTeam = tempTeams[homeIndex];
                let awayTeam = tempTeams[awayIndex];

                if (r >= roundsPerHalf) {
                    [homeTeam, awayTeam] = [awayTeam, homeTeam];
                }

                roundMatches.push({
                    id: `${r + 1}-${homeTeam.id}-${awayTeam.id}`,
                    round: r + 1,
                    homeTeam: homeTeam,
                    awayTeam: awayTeam,
                    homeScore: null,
                    awayScore: null,
                    played: false
                });
            }
        }
        championship.matches.push(...roundMatches);
        const fixedTeam = tempTeams[0];
        const lastTeam = tempTeams.pop();
        tempTeams.splice(1, 0, lastTeam);
        tempTeams[0] = fixedTeam;
    }
    championship.teams = championship.teams.filter(team => team.id !== 0);

    championship.totalRounds = championship.matches.reduce((max, match) => Math.max(max, match.round), 0);
}


// Simular uma partida
function simulateMatch(match) {
    const homeGoals = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 3);
    const awayGoals = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 3);
    
    match.homeScore = homeGoals;
    match.awayScore = awayGoals;
    match.played = true;
    
    updateTeamStats(match.homeTeam.id, homeGoals, awayGoals);
    updateTeamStats(match.awayTeam.id, awayGoals, homeGoals);
}

// Atualizar estatísticas do time
function updateTeamStats(teamId, goalsFor, goalsAgainst) {
    const team = championship.teams.find(t => t.id === teamId);
    if (!team) return;
    
    team.matches++;
    team.goalsFor += goalsFor;
    team.goalsAgainst += goalsAgainst;
    team.goalDiff = team.goalsFor - team.goalsAgainst;
    
    if (goalsFor > goalsAgainst) {
        team.wins++;
        team.points += 3;
    } else if (goalsFor === goalsAgainst) {
        team.draws++;
        team.points += 1;
    } else {
        team.losses++;
    }
}

// Ordenar classificação
function sortClassification() {
    championship.teams.sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points;
        if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff;
        if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name);
    });
}

// Renderizar classificação
function renderClassification() {
    const tbody = document.getElementById('classification-body');
    sortClassification();
    
    tbody.innerHTML = championship.teams.map((team, index) => {
        const position = index + 1;
        let positionClass = 'mid';
        
        if (position === 1) positionClass = 'champion';
        else if (position <= 4) positionClass = 'playoff';
        else if (position >= 9) positionClass = 'relegation';
        
        return `
            <tr>
                <td>
                    <div class="position ${positionClass}">${position}</div>
                </td>
                <td>
                    <div class="team-info">
                        <img src="logos/${team.logo}" alt="${team.name} Logo" class="team-logo-img">
                        <span class="team-name">${team.name}</span>
                    </div>
                </td>
                <td>${team.matches}</td>
                <td>${team.wins}</td>
                <td>${team.draws}</td>
                <td>${team.losses}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td style="color: ${team.goalDiff >= 0 ? '#51cf66' : '#ff6b6b'}">${team.goalDiff >= 0 ? '+' : ''}${team.goalDiff}</td>
                <td style="font-weight: bold; color: #ffcd3c">${team.points}</td>
            </tr>
        `;
    }).join('');
}

// Renderizar rodadas
function renderRounds() {
    const container = document.getElementById('matches-container');
    const roundMatches = championship.matches.filter(m => m.round === championship.currentRoundView);
    
    container.innerHTML = roundMatches.map(match => `
        <div class="match-card">
            <div class="match-teams">
                <div class="team home">
                    <img src="logos/${match.homeTeam.logo}" alt="${match.homeTeam.name} Logo" class="team-logo-img">
                    <span class="team-name">${match.homeTeam.name}</span>
                </div>
                <div class="vs">VS</div>
                <div class="team away">
                    <img src="logos/${match.awayTeam.logo}" alt="${match.awayTeam.name} Logo" class="team-logo-img">
                    <span class="team-name">${match.awayTeam.name}</span>
                </div>
            </div>
            ${match.played ? `
                <div class="match-score">${match.homeScore} - ${match.awayScore}</div>
            ` : `
                <div class="match-status">Não realizada</div>
            `}
        </div>
    `).join('');
    
    document.getElementById('round-display').textContent = `Rodada ${championship.currentRoundView}`;
    document.getElementById('prev-round').disabled = championship.currentRoundView <= 1;
    document.getElementById('next-round').disabled = championship.currentRoundView >= championship.totalRounds;
}

// Simular próxima rodada
function simulateNextRound() {
    if (championship.currentRound > championship.totalRounds) {
        alert('Campeonato já finalizado!');
        return;
    }
    
    const roundMatches = championship.matches.filter(m => m.round === championship.currentRound && !m.played);
    
    if (roundMatches.length === 0) {
        championship.currentRound++;
        simulateNextRound();
        return;
    }
    
    roundMatches.forEach(match => simulateMatch(match));
    
    showLastRoundResults(championship.currentRound);
    
    championship.currentRound++;
    
    updateDisplay();
    
    if (championship.currentRound > championship.totalRounds) {
        championship.isFinished = true;
        showChampion();
    }
}

// Mostrar resultados da última rodada simulada
function showLastRoundResults(roundNumber) {
    const lastRoundMatches = championship.matches.filter(m => m.round === roundNumber && m.played);
    
    if (lastRoundMatches.length === 0) return;
    
    const container = document.getElementById('simulator-matches');
    const resultsSection = document.getElementById('last-round-results');
    
    container.innerHTML = lastRoundMatches.map(match => {
        const homeWin = match.homeScore > match.awayScore;
        const awayWin = match.awayScore > match.homeScore;
        const draw = match.homeScore === match.awayScore;
        
        let resultText = '';
        if (draw) resultText = 'Empate';
        else if (homeWin) resultText = `Vitória do ${match.homeTeam.name}`;
        else resultText = `Vitória do ${match.awayTeam.name}`;
        
        return `
            <div class="simulator-match-card">
                <div class="simulator-match-teams">
                    <div class="simulator-team home">
                        <img src="logos/${match.homeTeam.logo}" alt="${match.homeTeam.name} Logo" class="simulator-team-logo-img">
                        <span class="simulator-team-name">${match.homeTeam.name}</span>
                    </div>
                    <div class="simulator-vs">VS</div>
                    <div class="simulator-team away">
                        <img src="logos/${match.awayTeam.logo}" alt="${match.awayTeam.name} Logo" class="simulator-team-logo-img">
                        <span class="simulator-team-name">${match.awayTeam.name}</span>
                    </div>
                </div>
                <div class="simulator-match-score">${match.homeScore} - ${match.awayScore}</div>
                <div class="simulator-match-result">${resultText}</div>
            </div>
        `;
    }).join('');
    
    const titleElement = resultsSection.querySelector('h3');
    titleElement.innerHTML = `<i class="fas fa-clock"></i> Resultados da Rodada ${roundNumber}`;
    
    resultsSection.style.display = 'block';
    
    setTimeout(() => {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 100);
}

// Simular todo o campeonato
function simulateAllRounds() {
    while (championship.currentRound <= championship.totalRounds) {
        const roundMatches = championship.matches.filter(m => m.round === championship.currentRound && !m.played);
        roundMatches.forEach(match => simulateMatch(match));
        championship.currentRound++;
    }
    
    championship.isFinished = true;
    updateDisplay();
    showChampion();
}

// Mostrar campeão
function showChampion() {
    sortClassification();
    const champion = championship.teams[0];
    
    document.getElementById('champion-name').textContent = champion.name;
    document.getElementById('champion-section').style.display = 'block';
    
    createFireworks();
}

// Criar efeito de fogos de artifício
function createFireworks() {
    const championCard = document.querySelector('.champion-card');
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.style.position = 'absolute';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            firework.style.fontSize = '1.5rem';
            firework.innerHTML = ['🎆', '✨', '🎉', '⭐'][Math.floor(Math.random() * 4)];
            firework.style.animation = 'firework 2s ease-out forwards';
            
            championCard.appendChild(firework);
            
            setTimeout(() => firework.remove(), 2000);
        }, i * 100);
    }
}

// Resetar campeonato
function resetChampionship() {
    championship.currentRound = 1;
    championship.currentRoundView = 1;
    championship.isFinished = false;
    
    championship.teams.forEach(team => {
        team.matches = 0;
        team.wins = 0;
        team.draws = 0;
        team.losses = 0;
        team.goalsFor = 0;
        team.goalsAgainst = 0;
        team.goalDiff = 0;
        team.points = 0;
    });
    
    generateAllMatches();
    
    document.getElementById('champion-section').style.display = 'none';
    document.getElementById('last-round-results').style.display = 'none';
    
    updateDisplay();
}

// Atualizar toda a exibição
function updateDisplay() {
    document.getElementById('current-round').textContent = championship.currentRound;
    renderClassification();
    renderRounds();
}

// Gerenciar navegação entre abas
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Configurar controles de rodadas
function setupRoundControls() {
    document.getElementById('prev-round').addEventListener('click', () => {
        if (championship.currentRoundView > 1) {
            championship.currentRoundView--;
            renderRounds();
        }
    });
    
    document.getElementById('next-round').addEventListener('click', () => {
        if (championship.currentRoundView < championship.totalRounds) {
            championship.currentRoundView++;
            renderRounds();
        }
    });
}

// Configurar controles do simulador
function setupSimulatorControls() {
    document.getElementById('simulate-round').addEventListener('click', () => {
        simulateNextRound();
        
        const button = document.getElementById('simulate-round');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Simulando...';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 1000);
    });
    
    document.getElementById('simulate-all').addEventListener('click', () => {
        if (confirm('Deseja simular todo o campeonato? Esta ação não pode ser desfeita.')) {
            const button = document.getElementById('simulate-all');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Simulando...';
            button.disabled = true;
            
            setTimeout(() => {
                simulateAllRounds();
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1500);
        }
    });
    
    document.getElementById('reset-championship').addEventListener('click', () => {
        if (confirm('Deseja resetar todo o campeonato? Todos os dados serão perdidos.')) {
            resetChampionship();
            const button = document.getElementById('reset-championship');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Resetado!';
            
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        }
    });
}

// Adicionar animações CSS personalizadas
function addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes firework {
            0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: scale(2) rotate(360deg);
                opacity: 0;
            }
        }
        
        .match-card:hover .team-logo-img { /* Corrigido para team-logo-img */
            transform: scale(1.1);
            transition: transform 0.3s ease;
        }
        
        .classification-table tbody tr:nth-child(1) {
            background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
        }
        
        .classification-table tbody tr:nth-child(2),
        .classification-table tbody tr:nth-child(3),
        .classification-table tbody tr:nth-child(4) {
            background: linear-gradient(90deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.05));
        }
        
        .classification-table tbody tr:nth-child(n+9) { /* Adjusted for 10 teams */
            background: linear-gradient(90deg, rgba(255, 71, 87, 0.1), rgba(255, 71, 87, 0.05));
        }
    `;
    document.head.appendChild(style);
}

// Adicionar funcionalidade de estatísticas detalhadas
function showDetailedStats(teamId) {
    const team = championship.teams.find(t => t.id === teamId);
    if (!team) return;
    
    const winRate = team.matches > 0 ? ((team.wins / team.matches) * 100).toFixed(1) : 0;
    const avgGoalsFor = team.matches > 0 ? (team.goalsFor / team.matches).toFixed(1) : 0;
    const avgGoalsAgainst = team.matches > 0 ? (team.goalsAgainst / team.matches).toFixed(1) : 0;
    
    alert(`Estatísticas de ${team.name}:
    
📊 Aproveitamento: ${winRate}%
⚽ Média de gols marcados: ${avgGoalsFor}
🥅 Média de gols sofridos: ${avgGoalsAgainst}
📈 Sequência atual: ${getTeamStreak(team)}`);
}

// Obter sequência atual do time
function getTeamStreak(team) {
    const teamMatches = championship.matches
        .filter(m => m.played && (m.homeTeam.id === team.id || m.awayTeam.id === team.id))
        .sort((a, b) => a.round - b.round);
    
    if (teamMatches.length === 0) return 'Nenhuma partida';
    
    const lastMatch = teamMatches[teamMatches.length - 1];
    let result;
    
    if (lastMatch.homeTeam.id === team.id) {
        if (lastMatch.homeScore > lastMatch.awayScore) result = 'V';
        else if (lastMatch.homeScore === lastMatch.awayScore) result = 'E';
        else result = 'D';
    } else {
        if (lastMatch.awayScore > lastMatch.homeScore) result = 'V';
        else if (lastMatch.awayScore === lastMatch.homeScore) result = 'E';
        else result = 'D';
    }
    
    return result === 'V' ? 'Vitória' : result === 'E' ? 'Empate' : 'Derrota';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    generateAllMatches();
    setupNavigation();
    setupRoundControls();
    setupSimulatorControls();
    addCustomAnimations();
    updateDisplay();
    
    // Adicionar cliques nos nomes dos times para estatísticas
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('team-name')) {
            const teamName = e.target.textContent;
            const team = championship.teams.find(t => t.name === teamName);
            if (team) showDetailedStats(team.id);
        }
    });
    
    console.log('🏆 Kings League Simulator inicializado!');
    console.log(`📊 ${teams.length} times carregados`);
    console.log(`⚽ ${championship.matches.length} partidas geradas`);
});