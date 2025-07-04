document.addEventListener('DOMContentLoaded', () => {
    const botoesNav = document.querySelectorAll('.botao-nav');
    const abas = document.querySelectorAll('.conteudo-aba');

    botoesNav.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesNav.forEach(b => b.classList.remove('ativo'));
            abas.forEach(aba => aba.classList.remove('ativo'));
            botao.classList.add('ativo');
            document.getElementById(botao.getAttribute('data-aba')).classList.add('ativo');
        });
    });

    document.getElementById('ir-simulador').addEventListener('click', () => {
        botoesNav.forEach(b => b.classList.remove('ativo'));
        abas.forEach(aba => aba.classList.remove('ativo'));
        document.querySelector('[data-aba="simulador"]').classList.add('ativo');
        document.getElementById('simulador').classList.add('ativo');
    });

    iniciarSimulador();
});

const times = [
    { id: 1, nome: 'Capim FC', logo: 'capimfc.png' },
    { id: 2, nome: 'Dendele FC', logo: 'dendelefc.png' },
    { id: 3, nome: 'Desimpedidos Goti', logo: 'desimpedidosgoti.png' },
    { id: 4, nome: 'FC Real Elite', logo: 'fcrealelite.png' },
    { id: 5, nome: 'Fluxo FC', logo: 'fluxofc.png' },
    { id: 6, nome: 'Funkbol Clube', logo: 'funkbolclube.png' },
    { id: 7, nome: 'Furia FC', logo: 'furiafc.png' },
    { id: 8, nome: 'G3X FC', logo: 'g3xfc.png' },
    { id: 9, nome: 'LOUD SC', logo: 'loudsc.png' },
    { id: 10, nome: 'Nyvelados FC', logo: 'nyveladosfc.png' }
];

let campeonato = {
    rodadaAtual: 1,
    totalRodadas: 9,
    times: [],
    partidas: [],
    visualizacaoRodada: 1
};

function zerarEstatisticasTimes() {
    campeonato.times.forEach(time => {
        time.jogos = 0;
        time.vitorias = 0;
        time.empates = 0;
        time.derrotas = 0;
        time.golsPro = 0;
        time.golsContra = 0;
        time.saldoGols = 0;
        time.pontos = 0;
    });
}

function gerarTodasPartidas() {
    campeonato.partidas = [];
    let tempTimes = [...times];

    if (tempTimes.length % 2 !== 0) {
        tempTimes.push({ id: 0, nome: 'BYE', logo: 'placeholder.png' });
    }

    const numTimes = tempTimes.length;
    const totalRodadasGerar = numTimes - 1;

    for (let r = 0; r < totalRodadasGerar; r++) {
        for (let i = 0; i < numTimes / 2; i++) {
            let mandante = tempTimes[i];
            let visitante = tempTimes[numTimes - 1 - i];
            if (mandante.id !== 0 && visitante.id !== 0) {
                campeonato.partidas.push({
                    id: `${r + 1}-${mandante.id}-${visitante.id}`,
                    rodada: r + 1,
                    mandante,
                    visitante,
                    golsMandante: null,
                    golsVisitante: null
                });
            }
        }
        const fixo = tempTimes[0];
        const ultimo = tempTimes.pop();
        tempTimes.splice(1, 0, ultimo);
        tempTimes[0] = fixo;
    }

    campeonato.totalRodadas = totalRodadasGerar;
}

function atualizarEstatisticasTime(timeId, golsPro, golsContra) {
    const time = campeonato.times.find(t => t.id === timeId);
    if (!time) return;
    time.jogos++;
    time.golsPro += golsPro;
    time.golsContra += golsContra;
    time.saldoGols = time.golsPro - time.golsContra;
    if (golsPro > golsContra) {
        time.vitorias++;
        time.pontos += 3;
    } else if (golsPro === golsContra) {
        time.empates++;
        time.pontos += 1;
    } else {
        time.derrotas++;
    }
}

function ordenarClassificacao() {
    campeonato.times.sort((a, b) => {
        if (a.pontos !== b.pontos) return b.pontos - a.pontos;
        if (a.saldoGols !== b.saldoGols) return b.saldoGols - a.saldoGols;
        if (a.golsPro !== b.golsPro) return b.golsPro - a.golsPro;
        return a.nome.localeCompare(b.nome);
    });
}

function renderizarClassificacao() {
    ordenarClassificacao();
    const tbody = document.getElementById('corpo-classificacao');
    tbody.innerHTML = campeonato.times.map((time, index) => {
        const classePosicao = index === 0 ? 'champion'
            : index < 6 ? 'playoff'
                : 'rest';
        return `
      <tr>
        <td><div class="position ${classePosicao}">${index + 1}</div></td>
        <td>
          <div class="info-time">
            <img src="logos/${time.logo}" alt="${time.nome} Logo" class="logo-time-img">
            <span class="nome-time">${time.nome}</span>
          </div>
        </td>
        <td>${time.jogos}</td>
        <td>${time.vitorias}</td>
        <td>${time.empates}</td>
        <td>${time.derrotas}</td>
        <td>${time.golsPro}</td>
        <td>${time.golsContra}</td>
        <td style="color:${time.saldoGols >= 0 ? '#51cf66' : '#ff6b6b'}">${time.saldoGols >= 0 ? '+' : ''}${time.saldoGols}</td>
        <td style="font-weight:bold;color:#ffcd3c">${time.pontos}</td>
      </tr>`;
    }).join('');
}

function renderizarRodadas() {
    const container = document.getElementById('container-partidas');
    const partidasRodada = campeonato.partidas.filter(p => p.rodada === campeonato.visualizacaoRodada);

    container.innerHTML = partidasRodada.map(partida => `
    <div class="cartao-partida">
      <div class="times-partida">
        <div class="time mandante">
          <img src="logos/${partida.mandante.logo}" alt="${partida.mandante.nome} Logo" class="logo-time-img">
          <span class="nome-time">${partida.mandante.nome}</span>
        </div>
        <div class="vs">VS</div>
        <div class="time visitante">
          <img src="logos/${partida.visitante.logo}" alt="${partida.visitante.nome} Logo" class="logo-time-img">
          <span class="nome-time">${partida.visitante.nome}</span>
        </div>
      </div>
      <div class="inputs-partida">
        <input type="number" min="0" value="${(partida.golsMandante !== null && !isNaN(partida.golsMandante)) ? partida.golsMandante : ''}"
          class="input-mandante"
          data-id-partida="${partida.id}"
          oninput="tratarInputPlacar('${partida.id}', 'mandante', this.value)" />
        <span> - </span>
        <input type="number" min="0" value="${(partida.golsVisitante !== null && !isNaN(partida.golsVisitante)) ? partida.golsVisitante : ''}"
          class="input-visitante"
          data-id-partida="${partida.id}"
          oninput="tratarInputPlacar('${partida.id}', 'visitante', this.value)" />
      </div>
    </div>
  `).join('');

    document.getElementById('exibir-rodada').textContent = `Rodada ${campeonato.visualizacaoRodada}`;
    document.getElementById('rodada-anterior').disabled = campeonato.visualizacaoRodada <= 1;
    document.getElementById('proxima-rodada').disabled = campeonato.visualizacaoRodada >= campeonato.totalRodadas;
}

function tratarInputPlacar(idPartida, lado, valor) {
    const partida = campeonato.partidas.find(p => p.id === idPartida);
    if (!partida) return;

    const valorNum = (valor === '') ? null : parseInt(valor);
    partida['gols' + (lado === 'mandante' ? 'Mandante' : 'Visitante')] = isNaN(valorNum) ? null : valorNum;

    zerarEstatisticasTimes();

    campeonato.partidas.forEach(p => {
        if (p.golsMandante !== null && p.golsVisitante !== null) {
            atualizarEstatisticasTime(p.mandante.id, p.golsMandante, p.golsVisitante);
            atualizarEstatisticasTime(p.visitante.id, p.golsVisitante, p.golsMandante);
        }
    });

    atualizarTela();
}

function atualizarTela() {
    renderizarClassificacao();
    renderizarRodadas();
}

function resetarCampeonato() {
    campeonato.rodadaAtual = 1;
    campeonato.visualizacaoRodada = 1;
    zerarEstatisticasTimes();
    campeonato.partidas.forEach(p => {
        p.golsMandante = null;
        p.golsVisitante = null;
    });
    atualizarTela();
}

function configurarControlesRodada() {
    document.getElementById('rodada-anterior').addEventListener('click', () => {
        if (campeonato.visualizacaoRodada > 1) {
            campeonato.visualizacaoRodada--;
            renderizarRodadas();
        }
    });
    document.getElementById('proxima-rodada').addEventListener('click', () => {
        if (campeonato.visualizacaoRodada < campeonato.totalRodadas) {
            campeonato.visualizacaoRodada++;
            renderizarRodadas();
        }
    });
}

function simularPartida(partida) {
    partida.golsMandante = Math.floor(Math.random() * 6);
    partida.golsVisitante = Math.floor(Math.random() * 6);
}

function simularProximaRodada() {
    if (campeonato.rodadaAtual > campeonato.totalRodadas) return;
    const partidasRodada = campeonato.partidas.filter(p => p.rodada === campeonato.rodadaAtual);
    partidasRodada.forEach(simularPartida);
    campeonato.rodadaAtual++;
    tratarInputPlacar('', '', '');
}

function simularTodasRodadas() {
    while (campeonato.rodadaAtual <= campeonato.totalRodadas) {
        simularProximaRodada();
    }
}

function configurarControlesSimulador() {
    document.getElementById('simular-rodada').addEventListener('click', () => {
        simularProximaRodada();
    });
    document.getElementById('simular-tudo').addEventListener('click', () => {
        if (confirm('Deseja simular todo o campeonato? Esta ação não pode ser desfeita.')) simularTodasRodadas();
    });
    document.getElementById('resetar-campeonato').addEventListener('click', () => {
        if (confirm('Deseja resetar todo o campeonato? Todos os dados serão perdidos.')) resetarCampeonato();
    });
}

function iniciarSimulador() {
    campeonato.times = times.map(t => ({ ...t }));
    zerarEstatisticasTimes();
    gerarTodasPartidas();
    configurarControlesRodada();
    configurarControlesSimulador();
    atualizarTela();
}
