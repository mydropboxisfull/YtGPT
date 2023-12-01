// DurationCalculator.js

const calculateDuration = (inputText) => {
    const lastBracketMatch = inputText.match(/\[(\d+\.\d+)\]/g).pop(); // Get the last set of brackets
    const seconds = parseFloat(lastBracketMatch.slice(1, -1));

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    const formattedDuration = `${minutes}m ${remainingSeconds}s`;

    return formattedDuration;
};

export default calculateDuration;
