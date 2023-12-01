const GetCaptions = async (videoLink) => {
  const extractVideoId = (link) => {
    const pattern = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const match = link.match(pattern);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(videoLink);

  if (!videoId) {
    throw new Error('Invalid YouTube video link.');
  }

  const formatCaptions = (captionsData) => {
    let formattedCaptions = '';

    captionsData.forEach((caption) => {
      formattedCaptions += `[${caption.start}] ${caption.text} `;

    });

    return formattedCaptions;
  };

  try {
    const response = await fetch(`/captions?videoId=${videoId}`);
    const captionsData = await response.json();
    return formatCaptions(captionsData);
  } catch (error) {
    throw new Error('Error fetching captions:', error);
  }
};

export { GetCaptions };
