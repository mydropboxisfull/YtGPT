import express from 'express';
import cors from 'cors';
import { getSubtitles } from 'youtube-captions-scraper';

const app = express();
const port = 3001; // Set your desired port

app.use(cors());

app.get('/captions', async (req, res) => {
    const videoId = req.query.videoId; // The video ID from the client request
    const lang = 'en'; // Set the desired language

    try {
        const captions = await getSubtitles({ videoID: videoId, lang });
        res.json(captions);
    } catch (error) {
        console.error('Error fetching captions:', error);
        res.status(500).json({ error: 'Unable to fetch captions' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
