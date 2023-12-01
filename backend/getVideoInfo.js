import axios from 'axios';
import { JSDOM } from 'jsdom';

export async function getVideoInfo(videoURL) {
    try {
        const { data } = await axios.get(videoURL);
        const dom = new JSDOM(data);

        // Extracting video title
        const titleElement = dom.window.document.querySelector('meta[property="og:title"]');
        const title = titleElement ? titleElement.getAttribute('content') : null;

        // Extracting video description
        const descriptionElement = dom.window.document.querySelector('meta[property="og:description"]');
        const description = descriptionElement ? descriptionElement.getAttribute('content') : null;

        if (!title || !description) {
            throw new Error('Failed to retrieve video information.');
        }

        return { title, description };
    } catch (error) {
        throw new Error(`Error fetching video information: ${error.message}`);
    }
}
