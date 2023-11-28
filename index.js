import express from 'express';
import cors from 'cors';
import { getSubtitles } from 'youtube-captions-scraper';
import path from 'path'; // Import the 'path' module


const app = express();
const port = 3001;

app.use(cors());

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

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist/index.html'));
});






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
