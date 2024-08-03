import { useEffect } from 'react';

function HomePage() {
    useEffect(() => {
        // A função só será executada no lado do cliente, após a renderização do componente.
        function generateQuestion() {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            const correctAnswer = num1 * num2;
            document.getElementById('question').textContent = `Quanto é ${num1} x ${num2}?`;
            document.getElementById('result').textContent = '';
            document.getElementById('answer').value = '';
        }

        function checkAnswer() {
            const userAnswer = parseInt(document.getElementById('answer').value, 10);
            const correctAnswer = parseInt(document.getElementById('question').textContent.split(' x ')[1], 10);
            if (userAnswer === correctAnswer) {
                document.getElementById('result').textContent = 'Parabéns! Você é incrível!';
                generateQuestion();
            } else {
                document.getElementById('result').textContent = 'Tente novamente!';
            }
        }

        function resetGame() {
            generateQuestion();
        }

        // Adiciona os eventos de clique nos botões
        document.getElementById('submitBtn').addEventListener('click', checkAnswer);
        document.getElementById('resetBtn').addEventListener('click', resetGame);

        // Inicializa a primeira pergunta
        generateQuestion();

    }, []); // O array vazio garante que o efeito só execute uma vez

    return (
        <div className="container">
            <h1>Tabuada Interativa</h1>
            <div id="question"></div>
            <input type="number" id="answer" placeholder="Digite sua resposta" />
            <button id="submitBtn">Enviar Resposta</button>
            <button id="resetBtn">Reiniciar Jogo</button>
            <div id="result"></div>
        </div>
    );
}

export default HomePage;


