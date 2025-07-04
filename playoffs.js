document.addEventListener('DOMContentLoaded', () => {
    const chaveamentoDiv = document.getElementById('chaveamento');
    const quartasDiv = document.querySelector('#quartas .confrontos');
    const semisDiv = document.querySelector('#semis .confrontos');
    const finalDiv = document.querySelector('#final .confrontos');
    const campeaoDiv = document.getElementById('campeao');

    const dados = localStorage.getItem('classificacaoFinal');
    const partidasSalvas = localStorage.getItem('estadoCampeonato');

    if (!dados || !partidasSalvas) {
        chaveamentoDiv.innerHTML = "<p style='text-align:center'>Você precisa simular todo o campeonato antes de ver os Playoffs!</p>";
        return;
    }

    const campeonatoSalvo = JSON.parse(partidasSalvas);

    const partidasIncompletas = campeonatoSalvo.partidas.some(
        p => p.golsMandante === null || p.golsVisitante === null
    );

    if (partidasIncompletas) {
        chaveamentoDiv.innerHTML = "<p style='text-align:center'>Rodadas insuficientes para simular os Playoffs. Termine todas as rodadas primeiro.</p>";
        return;
    }

    let classificacao = JSON.parse(dados);

    classificacao.sort((a, b) =>
        b.pontos - a.pontos || b.saldoGols - a.saldoGols || b.golsPro - a.golsPro
    );

    if (classificacao.length < 7) {
        chaveamentoDiv.innerHTML = "<p style='text-align:center'>Rodadas insuficientes para simular os Playoffs. Termine todas as rodadas primeiro.</p>";
        return;
    }

    const primeiro = classificacao[0];
    const quartasConfrontos = [
        [classificacao[1], classificacao[6]], // 2º vs 7º
        [classificacao[2], classificacao[5]], // 3º vs 6º
        [classificacao[3], classificacao[4]]  // 4º vs 5º
    ];

    let resultadosQuartas = [];
    let resultadosSemis = [];
    let resultadoFinal = null;

    function criarConfrontoCard(container, partida, fase, onConfirmar) {
        const div = document.createElement('div');
        div.className = 'confronto';

        const header = document.createElement('div');
        header.className = 'confronto-header';

        header.innerHTML = `
      <div class="time-info">
        <img src="logos/${partida.mandante.logo}" alt="">
        <span>${partida.mandante.nome}</span>
      </div>
      <span>${fase}</span>
      <div class="time-info">
        <span>${partida.visitante.nome}</span>
        <img src="logos/${partida.visitante.logo}" alt="">
      </div>
    `;
        div.appendChild(header);

        const placarDiv = document.createElement('div');
        placarDiv.className = 'inputs-placar';

        if (partida.golsMandante !== null && partida.golsVisitante !== null) {
            placarDiv.textContent = `${partida.golsMandante} × ${partida.golsVisitante}`;
        } else {
            placarDiv.innerHTML = `
        <input type="number" min="0" class="input-gol" placeholder="0">
        <span> - </span>
        <input type="number" min="0" class="input-gol" placeholder="0">
      `;

            const btn = document.createElement('button');
            btn.className = 'simular-btn';
            btn.textContent = 'Confirmar Resultado';

            btn.addEventListener('click', () => {
                const inputs = placarDiv.querySelectorAll('.input-gol');
                const golsMandante = parseInt(inputs[0].value);
                const golsVisitante = parseInt(inputs[1].value);

                if (isNaN(golsMandante) || isNaN(golsVisitante)) {
                    alert("Preencha os dois placares para confirmar!");
                    return;
                }

                partida.golsMandante = golsMandante;
                partida.golsVisitante = golsVisitante;

                placarDiv.textContent = `${golsMandante} × ${golsVisitante}`;
                btn.remove();
                onConfirmar();
            });

            div.appendChild(placarDiv);
            div.appendChild(btn);
        }

        container.appendChild(div);
    }

    function simularFase(confrontos, container, fase, proximaFase) {
        container.innerHTML = '';
        let vencedores = [];

        confrontos.forEach(partida => {
            criarConfrontoCard(container, partida, fase, () => {
                const vencedor = partida.golsMandante >= partida.golsVisitante ? partida.mandante : partida.visitante;
                vencedores.push(vencedor);

                if (vencedores.length === confrontos.length) {
                    proximaFase(vencedores);
                }
            });
        });
    }

    function iniciarPlayoffs() {
        resultadosQuartas = quartasConfrontos.map(([a, b]) => ({
            mandante: a,
            visitante: b,
            golsMandante: null,
            golsVisitante: null
        }));
        simularFase(resultadosQuartas, quartasDiv, 'Quartas de Final', iniciarSemis);
    }

    function iniciarSemis(vencedoresQuartas) {
        resultadosSemis = [
            { mandante: primeiro, visitante: vencedoresQuartas[0], golsMandante: null, golsVisitante: null },
            { mandante: vencedoresQuartas[1], visitante: vencedoresQuartas[2], golsMandante: null, golsVisitante: null }
        ];
        simularFase(resultadosSemis, semisDiv, 'Semifinal', iniciarFinal);
    }

    function iniciarFinal(vencedoresSemis) {
        resultadoFinal = {
            mandante: vencedoresSemis[0],
            visitante: vencedoresSemis[1],
            golsMandante: null,
            golsVisitante: null
        };
        finalDiv.innerHTML = '';
        criarConfrontoCard(finalDiv, resultadoFinal, 'Final', mostrarCampeao);
    }

    function mostrarCampeao() {
        const campeao = resultadoFinal.golsMandante >= resultadoFinal.golsVisitante
            ? resultadoFinal.mandante
            : resultadoFinal.visitante;
        campeaoDiv.innerHTML = `🏆 Campeão: <strong>${campeao.nome}</strong>`;
    }

    iniciarPlayoffs();
});
