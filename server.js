require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Serve a página HTML na raiz
app.use(express.static(path.join(__dirname, 'public')));

// Rota explícita para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para o chat
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).send('No message provided.');
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant.'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: 500,
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

        res.json({ response: completionData });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : 'Failed to process the message' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
