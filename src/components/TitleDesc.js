import axios from 'axios';
import cheerio from 'cheerio';

export async function getVideoInfo(videoURL) {
    const { data } = await axios.get(videoURL);

    const $ = cheerio.load(data);

    // Extracting video title
    const title = $('meta[property="og:title"]').attr('content');

    // Extracting video description
    const description = $('meta[property="og:description"]').attr('content');

    if (!title || !description) {
        throw new Error('Failed to retrieve video information.');
    }

    return { title, description };
}
