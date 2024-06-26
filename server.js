require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000;

app.use(express.json());

app.post('/analyze-text', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('No text provided.');
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: `Extraia as disciplinas e os conteúdos das matérias deste edital:\n\n${text}\n\nDisciplinas:\n- `,
            max_tokens: 500,
            stop: ['\n\n'],
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const apiResponse = response.data.choices[0].text.trim().split('\n');
        console.log('Resposta da API:', apiResponse);  // Log da resposta da API

        const disciplines = apiResponse.filter(line => line.startsWith('-')).map(line => line.substring(2).trim());
        const topics = apiResponse.filter(line => !line.startsWith('-')).map(line => line.trim());

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
