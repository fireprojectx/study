import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { TailSpin } from 'react-loader-spinner';

const Home = () => {
    const [discipline, setDiscipline] = useState('');
    const [content, setContent] = useState('');
    const [notes, setNotes] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [studyDuration, setStudyDuration] = useState(0);
    const [history, setHistory] = useState([]);
    const [paused, setPaused] = useState(false);
    const [pauseStartTime, setPauseStartTime] = useState(null);
    const [accumulatedPauseTime, setAccumulatedPauseTime] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [disciplineOptions, setDisciplineOptions] = useState([]);
    const [contentOptions, setContentOptions] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let intervalId;
        if (startTime && !paused) {
            intervalId = setInterval(() => {
                const currentTime = new Date();
                const duration = (currentTime - startTime - accumulatedPauseTime) / 1000;
                setStudyDuration(duration);
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [startTime, paused, accumulatedPauseTime]);

    const startStudy = (event) => {
        event.preventDefault();
        if (!discipline || !content) {
            alert('Por favor, preencha a Disciplina e o Conteúdo.');
            return;
        }
        setStartTime(new Date());
        setStudyDuration(0);
        setAccumulatedPauseTime(0);
        setPaused(false);
    };

    const finalizeStudy = (event) => {
        event.preventDefault();
        if (!startTime) {
            alert("Não há estudo em andamento.");
            return;
        }
        const endTime = new Date();
        const duration = (endTime - startTime - accumulatedPauseTime) / 1000;
        setStudyDuration(duration);
        setHistory([...history, { date: new Date().toLocaleDateString(), discipline, content, duration, notes }]);
        setShowSummary(true);
        setStartTime(null);
        setPaused(false);
        setAccumulatedPauseTime(0);
    };

    const pauseStudy = (event) => {
        event.preventDefault();
        if (!paused) {
            setPaused(true);
            setPauseStartTime(new Date());
        }
    };

    const continueStudy = (event) => {
        event.preventDefault();
        if (paused) {
            const currentPauseDuration = new Date() - pauseStartTime;
            setAccumulatedPauseTime(accumulatedPauseTime + currentPauseDuration);
            setPaused(false);
            setPauseStartTime(null);
        }
    };

    const handleTextSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/analyze-text', { text });

            console.log('Resposta da análise:', response.data);
            setDisciplineOptions(response.data.disciplines);
            setContentOptions(response.data.topics);
        } catch (error) {
            console.error('Failed to analyze text:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text(`Disciplina: ${discipline}`, 10, 10);
        doc.text(`Conteúdo: ${content}`, 10, 20);
        doc.text(`Duração: ${Math.round(studyDuration / 60)} minutos`, 10, 30);
        doc.text(`Anotações: ${notes}`, 10, 40);
        doc.save('resumo_estudo.pdf');
    };

    const downloadHistory = () => {
        const ws = XLSX.utils.json_to_sheet(history.map(item => ({
            Data: item.date,
            Disciplina: item.discipline,
            Conteúdo: item.content,
            Duração: `${Math.round(item.duration / 60)} minutos`,
            Anotações: item.notes
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Histórico de Estudos");
        XLSX.writeFile(wb, "historico_estudos.xlsx");
    };

    return (
        <div>
            <Head>
                <title>Temporizador de Estudos - Marque o X no Lugar Certo</title>
                <style>{`
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(to bottom, #003366, #006699);
                        margin: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 20px;
                    }
                    .container {
                        background: linear-gradient(to bottom, #003366, #006699);
                        border-radius: 20px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                        width: 100%;
                        max-width: 800px;
                        margin: 20px 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    button {
                        background-color: #67B18F;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        margin: 10px 5px;
                        border-radius: 10px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #5b9a7e;
                    }
                    h1, h2, h3 {
                        color: white;
                    }
                    input, select, textarea {
                        width: 100%;
                        padding: 10px;
                        margin: 5px 0 10px 0;
                        display: inline-block;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        box-sizing: border-box;
                    }
                    form {
                        margin-bottom: 20px;
                    }
                    label {
                        display: inline-block;
                        width: 100px;
                        color: white;
                    }
                    input, textarea {
                        padding: 5px;
                        margin-bottom: 10px;
                    }
                    textarea {
                        width: calc(100% - 110px);
                        height: 100px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    table, th, td {
                        border: 1px solid #ddd;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #67B18F;
                        color: white;
                    }
                    #summaryModal {
                        display: none;
                        position: fixed;
                        z-index: 1;
                        padding-top: 100px;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        overflow: auto;
                        background-color: rgba(0, 0, 0, 0.4);
                    }
                    #summaryModalContent {
                        background-color: #fefefe;
                        margin: auto;
                        padding: 20px;
                        border: 1px solid #888;
                        width: 80%;
                        max-width: 600px;
                    }
                    #summaryModalContent h2, p {
                        color: #333;
                    }
                    #closeSummary {
                        background-color: #67B18F;
                        color: white;
                        padding: 10px 15px;
                        border: none;
                        cursor: pointer;
                        border-radius: 10px;
                    }
                    #closeSummary:hover {
                        background-color: #5b9a7e;
                    }
                    .alert {
                        color: red;
                    }
                    #startTime, #currentTime, #studyDuration {
                        color: white;
                    }
                    @media (max-width: 600px) {
                        body {
                            padding: 10px;
                        }
                        .container {
                            padding: 15px;
                            width: 100%;
                        }
                        button {
                            width: 100%;
                            padding: 15px;
                        }
                        input, select, textarea {
                            padding: 15px;
                        }
                        h1 {
                            font-size: 1.5em;
                        }
                        h2 {
                            font-size: 1.3em;
                        }
                        h3 {
                            font-size: 1.1em;
                        }
                        label {
                            width: 100%;
                        }
                        textarea {
                            width: 100%;
                            height: auto;
                        }
                        #summaryModalContent {
                            width: 90%;
                        }
                    }
                `}</style>
            </Head>
            <div className="container">
                <h1>Marque o X no Lugar Certo</h1>
                <textarea
                    placeholder="Cole o conteúdo das matérias aqui..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ height: '150px', marginBottom: '10px' }}
                ></textarea>
                <button onClick={handleTextSubmit} disabled={loading}>
                    {loading ? 'Analisando...' : 'Enviar Texto para Análise'}
                </button>
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        <TailSpin
                            height="50"
                            width="50"
                            color="#67B18F"
                            ariaLabel="loading"
                        />
                    </div>
                )}
                <StudyForm
                    discipline={discipline}
                    setDiscipline={setDiscipline}
                    content={content}
                    setContent={setContent}
                    notes={notes}
                    setNotes={setNotes}
                    startStudy={startStudy}
                    disciplineOptions={disciplineOptions}
                    contentOptions={contentOptions}
                />
                {startTime && (
                    <StudyTracking
                        startTime={startTime}
                        currentTime={new Date()}
                        studyDuration={studyDuration}
                        pauseStudy={pauseStudy}
                        continueStudy={continueStudy}
                        finalizeStudy={finalizeStudy}
                    />
                )}
                <StudyHistory history={history} />
                {showSummary && (
                    <StudySummary
                        discipline={discipline}
                        content={content}
                        studyDuration={studyDuration}
                        notes={notes}
                        downloadPDF={downloadPDF}
                        setShowSummary={setShowSummary}
                    />
                )}
                <button id="downloadHistory" onClick={downloadHistory}>Baixar Histórico</button>
            </div>
        </div>
    );
};

const StudyForm = ({ discipline, setDiscipline, content, setContent, notes, setNotes, startStudy, disciplineOptions, contentOptions }) => (
    <form id="productForm">
        <label htmlFor="discipline">Disciplina:</label>
        <select id="discipline" value={discipline} onChange={(e) => setDiscipline(e.target.value)} style={{ width: 'calc(100% - 110px)' }}>
            <option value="">Selecione uma disciplina</option>
            {disciplineOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
            ))}
        </select><br /><br />
        <label htmlFor="content">Conteúdo:</label>
        <select id="content" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: 'calc(100% - 110px)' }}>
            <option value="">Selecione um conteúdo</option>
            {contentOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
            ))}
        </select><br /><br />
        <label htmlFor="notes">Anotações:</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: 'calc(100% - 110px)' }}></textarea><br /><br />
        <button type="button" onClick={startStudy}>Iniciar Estudo</button>
    </form>
);

const StudyTracking = ({ startTime, currentTime, studyDuration, pauseStudy, continueStudy, finalizeStudy }) => (
    <div id="studyTracking">
        <p>Hora de Início: <span id="startTime">{startTime.toLocaleTimeString()}</span></p>
        <p>Hora Atual: <span id="currentTime">{currentTime.toLocaleTimeString()}</span></p>
        <p>Tempo de Estudo: <span id="studyDuration">{formatDuration(studyDuration)}</span></p>
        <button type="button" onClick={pauseStudy}>Pausar</button>
        <button type="button" onClick={continueStudy}>Continuar</button>
        <button type="button" onClick={finalizeStudy}>Finalizar</button>
    </div>
);

const StudyHistory = ({ history }) => (
    <div id="history">
        <h2>Histórico de Estudos</h2>
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Disciplina</th>
                    <th>Conteúdo</th>
                    <th>Duração</th>
                    <th>Anotações</th>
                </tr>
            </thead>
            <tbody>
                {history.map((item, index) => (
                    <tr key={index}>
                        <td>{item.date}</td>
                        <td>{item.discipline}</td>
                        <td>{item.content}</td>
                        <td>{formatDuration(item.duration)}</td>
                        <td>{item.notes}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const StudySummary = ({ discipline, content, studyDuration, notes, downloadPDF, setShowSummary }) => (
    <div id="summaryModal" style={{ display: 'block' }}>
        <div id="summaryModalContent">
            <h2>Resumo do Estudo</h2>
            <p>Disciplina: <span id="summaryDiscipline">{discipline}</span></p>
            <p>Conteúdo: <span id="summaryContent">{content}</span></p>
            <p>Duração: <span id="summaryDuration">{formatDuration(studyDuration)}</span></p>
            <p>Anotações: <span id="summaryNotes">{notes}</span></p>
            <button id="downloadSummary" onClick={downloadPDF}>Baixar PDF</button>
            <button id="closeSummary" onClick={() => setShowSummary(false)}>Fechar</button>
        </div>
    </div>
);

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default Home;
