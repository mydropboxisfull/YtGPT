import express from 'express';
import cors from 'cors';
import { getSubtitles } from 'youtube-captions-scraper';
import path from 'path';
import fetch from 'node-fetch'; // Import 'node-fetch' for making requests on the server side
import { getVideoInfo } from './getVideoInfo.js';


import dotenv from 'dotenv';
dotenv.config();

const API = process.env.GPT_KEY;




const app = express();
const port = 3001;

app.use(cors());
app.use(express.json()); // Add this line to parse JSON requests

// Serve static files from the 'dist' folder
app.use(express.static('dist'));


app.get('/captions', async (req, res) => {
    const videoId = req.query.videoId;
    const lang = 'en';

    try {
        const captions = await getSubtitles({ videoID: videoId, lang });
        res.json(captions);
    } catch (error) {
        console.error('Error fetching captions:', error);
        res.status(500).json({ error: 'Unable to fetch captions' });
    }
});

// New route for handling OpenAI API requests
app.post('/openai', async (req, res) => {
    const { message } = req.body;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + API,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo-1106",
                messages: [{ role: "user", content: message }],
            }),
        });

        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Error making OpenAI API request:', error);
        res.status(500).json({ error: 'Unable to make OpenAI API request' });
    }
});


// Youtube title and desc meta
app.get('/video-info', async (req, res) => {
    const videoURL = req.query.videoURL;

    try {
        const videoInfo = await getVideoInfo(videoURL);
        res.json(videoInfo);
    } catch (error) {
        console.error('Error fetching video information:', error.message);
        res.status(500).json({ error: 'Unable to fetch video information' });
    }
});



// Serve the index.html file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist/index.html'));
});




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
