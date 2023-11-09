const GetCaptions = async (videoLink) => {
  const extractVideoId = (link) => {
    const pattern = /(?:youtube.com\/watch\?v=|youtu.be\/|youtube.com\/embed\/|youtube.com\/v\/|youtube.com\/playlist\?list=)([\w-]+)/;
    const match = link.match(pattern);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(videoLink);

  if (!videoId) {
    throw new Error('Invalid YouTube video link.');
  }

  const formatCaptions = (captionsData) => {
    let formattedCaptions = '';
    let includeTimestamp = false;

    captionsData.forEach((caption, index) => {
      if (includeTimestamp) {
        formattedCaptions += `[${caption.start}] ${caption.text} `;
      } else {
        formattedCaptions += `${caption.text} `;
      }

      // Include timestamp every third time
      if ((index + 1) % 3 === 0) {
        includeTimestamp = !includeTimestamp;
      }
    });

    return formattedCaptions;
  };

  try {
    const response = await fetch(`http://localhost:3001/captions?videoId=${videoId}`);
    const captionsData = await response.json();
    return formatCaptions(captionsData);
  } catch (error) {
    throw new Error('Error fetching captions:', error);
  }
};

export { GetCaptions };
