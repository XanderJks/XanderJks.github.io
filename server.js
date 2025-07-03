require('dotenv').config(); // Laad omgevingsvariabelen vanuit .env
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai'); // Importeer OpenAI op de juiste manier

const app = express();
const port = process.env.PORT || 3000; // Poort waarop de server luistert

// Initialiseer OpenAI met de API-sleutel uit de omgevingsvariabelen
// Zorg ervoor dat process.env.OPENAI_API_KEY correct is ingesteld in je .env bestand
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors()); // Maakt het mogelijk voor je frontend om aanvragen te doen
app.use(express.json()); // Zorgt ervoor dat je JSON-body's kunt parsen

// API Endpoint voor de chatbot
app.post('/api/chat', async (req, res) => {
  const { message } = req.body; // Haal het bericht van de gebruiker op uit de request body

  // Basisvalidatie: controleer of er een bericht is meegestuurd
  if (!message) {
    return res.status(400).json({ error: 'Bericht is vereist in de request body.' });
  }

  try {
    // Roep de OpenAI API aan
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Je kunt hier ook een ander model kiezen, bijv. "gpt-4"
      messages: [{ role: "user", content: message }],
    });

    // Stuur het antwoord van OpenAI terug naar de frontend
    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    // Log de fout voor debugging op de server
    console.error('Fout bij het communiceren met OpenAI API:', error);

    // Stuur een gepaste foutmelding terug naar de frontend
    if (error.response) {
      // Als er een specifieke foutrespons van OpenAI is
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json({ error: error.response.data.error.message || 'Fout van OpenAI API.' });
    } else {
      // Algemene serverfout
      res.status(500).json({ error: 'Interne serverfout bij het verwerken van je verzoek.' });
    }
  }
});

// Start de server
app.listen(port, () => {
  console.log(`Backend server luistert op http://localhost:${port}`);
  console.log(`OpenAI API Key geladen: ${process.env.OPENAI_API_KEY ? 'Ja' : 'Nee'}`); // Controleer of de sleutel is geladen
});