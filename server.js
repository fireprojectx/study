require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Rota para servir uma página inicial simples
app.get('/', (req, res) => {
    res.send('Servidor está funcionando corretamente. Use a rota /analyze-text para enviar texto para análise.');
});

app.post('/analyze-text', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('No text provided.');
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that extracts information from text.'
                },
                {
                    role: 'user',
                    content: `Extraia as disciplinas e conteúdos das matérias deste edital:\n\n${text}\n\nDisciplinas e Conteúdos:`
                }
            ],
            max_tokens: 1000,
            n: 1,
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const completionData = response.data.choices[0].message.content;
        console.log('Resposta da API:', completionData);  // Log da resposta da API

        let disciplines = [];
        let topics = [];

        // Tentar fazer parsing do JSON se for possível
        try {
            const parsedData = JSON.parse(completionData);
            disciplines = parsedData.disciplines || [];
            topics = parsedData.contents || [];
        } catch (error) {
            // Se não for JSON, tratar como texto e fazer a extração manual
            const lines = completionData.split('\n');
            lines.forEach(line => {
                if (line.toLowerCase().includes('disciplina')) {
                    disciplines.push(line.replace('Disciplina: ', '').trim());
                } else if (line.toLowerCase().includes('conteúdo')) {
                    topics.push(line.replace('Conteúdo: ', '').trim());
                }
            });
        }

        console.log('Disciplinas:', disciplines);  // Log das disciplinas
        console.log('Tópicos:', topics);  // Log dos tópicos

        res.json({ disciplines, topics });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze text' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
