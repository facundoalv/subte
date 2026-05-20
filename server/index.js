require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } 
});


// Función para analizar el texto
async function textAnalyzer(text) {
    try {
        const prompt = `Eres un experto en psicología musical. Analiza este texto: "${text}". 
        Responde ÚNICAMENTE con un JSON puro con estas claves numéricas: 
        "valence" (0.0 a 1.0) y "energy" (0.0 a 1.0).`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()); 
    } catch (error) {
        console.error('Error con Gemini:', error);
        return { valence: 0.5, energy: 0.5 }; 
    }
}

app.post('/api/analyze', async (req, res) => {
    
    const { sentimiento, genero } = req.body; 
    if (genero) {
    const listaGeneros = genero.split(','); 

    if (listaGeneros.length > 5) {
        return res.status(400).json({ 
            error: "Spotify solo permite un máximo de 5 géneros por búsqueda." 
        });
    }
}
    if (!sentimiento) {
        return res.status(400).json({ error: "Falta el campo 'sentimiento' en el cuerpo de la petición." });
    }

    try {
        // 1. Analizamos el sentimiento con OpenAI
        const { valence, energy } = await textAnalyzer(sentimiento);
        console.log(`Valence obtenido: ${valence}, Energy obtenido: ${energy}`);

        
        const authResponse = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const accessToken = authResponse.data.access_token;

        // solicitamos las reconemdaciones :D
        const searchResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                seed_genres: genero || 'rock', // si no mandan género, tira 'rock' por defecto para que no rompa
                target_valence: valence,
                target_energy: energy,
                limit: 15
            }
        });

        // Enviamos la respuesta combinada al frontend
        res.json({
            emocion: { valence, energy },
            canciones: searchResponse.data.tracks
        });

    } catch (error) {
        console.error("Error en el endpoint /api/analyze:", error.response?.data || error.message);
        res.status(500).json({ error: "Hubo un problema procesando tu solicitud." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend escuchando en http://localhost:${PORT}`);
});


