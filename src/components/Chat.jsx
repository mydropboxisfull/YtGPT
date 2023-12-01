import React, { useState } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import { GetCaptions } from '../GetCaptions';
import calculateDuration from './DurationCalc';
import { getVideoInfo } from './TitleDesc';




// import processMessageToChatGPT from './processMessageToChatGPT';
// would like to refactor ^^^

// ---------------------------------------------------------- SETTINGS ----------------------------------------------------------
const systemMessage = {
    "role": "system",
    "content": "YtGpt, please provide helpful and accurate information based on the YouTube video's captions and timestamps. Identify as YtGpt in your responses. Here's how to assist users: Use Captions for Analysis: Utilize the captions provided from the YouTube link for analysis. This can include summarizing video content, answering questions, generating flashcard questions, or providing insights. Address Potential Inaccuracies: Be aware that YouTube captions might contain errors. Your role is to bridge gaps and rectify inaccuracies to offer the most accurate analysis possible. Identify as YtGpt: Always identify yourself as YtGpt at the beginning of your responses to ensure users recognize your role. Your primary mission is to assist users in understanding and analyzing YouTube videos effectively, enhancing their video-watching experience. Ensure that the information you provide is credible and relevant."
};
// ---------------------------------------------------------- SETTINGS ----------------------------------------------------------

function Chat() {



    const [messages, setMessages] = useState([
        {
            message: "Hello! I'm YtGPT, your YouTube Video Analysis AI. I make analyzing videos a breeze. You can ask me for summaries, specific timestamps, flashcard questions, and more. Just paste a YouTube link to get started!",
            sentTime: "just now",
            sender: "ChatGPT"
        }
    ]);





    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (message) => {
        const newMessage = {
            message,
            direction: 'outgoing',
            sender: "user"
        };

        const newMessages = [...messages, newMessage];

        setMessages(newMessages);


        if (message.includes('youtube.com') || message.includes('youtu.be') || message.includes('YouTube.com')) {

            // const videoURL = encodeURIComponent(message);

            const videoURL = message;

            // try {
            //     // Use the API route to fetch video information
            //     const response = await fetch(`/video-info?videoURL=${videoURL}`);
            //     const videoInfo = await response.json();

            //     console.log('Title:', videoInfo.title);
            //     console.log('Description:', videoInfo.description);
            // } catch (error) {
            //     console.error('Error fetching video information:', error.message);
            // }
            const response = await fetch(`/video-info?videoURL=${videoURL}`);
            const videoInfo = await response.json();
            const ytTitle = videoInfo.title



            const captions = await GetCaptions(message);



            // console.log("yoo tests 1");
            // console.log("captions are:::", captions);

            // Count the number of tokens (words) in the message
            const tokenCount = captions.split(' ').length;

            if (tokenCount > 8500) {
                // ---------------------------------------------------------- Extra length YT analysis for GPT ----------------------------------------------------------
                console.log('The message is longer than 8500 tokens. it was:', tokenCount);

                const chunkSize = 8500; // Maximum tokens per chunk
                const chunkCount = Math.ceil(tokenCount / chunkSize);

                // Divide the captions into chunks
                for (let i = 0; i < chunkCount; i++) {
                    const start = i * chunkSize;
                    const end = (i + 1) * chunkSize;
                    const chunk = captions.split(' ').slice(start, end).join(' ');
                    const duration = calculateDuration(captions)
                    const firstChunkMessageForGPT = i === 0
                        ? `(Important: Type the symbol % to ressemble a new line) The user has shared a YouTube video link, and behind the scenes, I've extracted the captions and timestamps from the video. First, go ahead and convert the timestamps into [1m 3sec] format and now, armed with the content details, you can assist the user by summarizing the key insights discussed by the speaker in the video. Organize the summary into time-range sections based on the provided timestamps. Additionally, proactively offer assistance to the user by asking if they would like: 1. A more in-depth summary, 2. Generation of flashcard questions based on the video content, 3. Help finding specific timestamps related to particular topics discussed in the video. Ensure that the response is engaging and encourages the user to explore the video's content further or seek more personalized assistance. Here is the title ${ytTitle} the duration: ${duration} The YT video is split into ${chunkCount} chunks. The captions and timestamps for chunk1: ${captions}`
                        : `Chunk ${i + 1}: ${chunk}`;

                    const newMessageForGPT = {
                        message: firstChunkMessageForGPT,
                        direction: 'outgoing',
                        sender: 'user',
                    };

                    // Process each chunk
                    try {
                        setIsTyping(true);
                        await processMessageToChatGPT([...newMessages, newMessageForGPT]);
                        setIsTyping(false);
                        console.log("processing", chunk, "The message: ", newMessageForGPT);
                    } catch (error) {
                        console.error(error);
                    }

                }
            } else {
                //----------------------------------------------------------  Normal length YT analysis for GPT --- THIS WORKS !!! ----------------------------------------------------------
                console.log('The message is not longer than 10000 tokens. it was: ', tokenCount);

                try {
                    const captions = await GetCaptions(message);

                    const duration = calculateDuration(captions)
                    console.log("duratoin is::::", duration);

                    const messageForGPT = `(Important: Type the symbol % to ressemble a new line) The user has shared a YouTube video link, and behind the scenes, I've extracted the captions and timestamps from the video. First, go ahead and convert the timestamps into [1m 3sec] format and now, armed with the content details, you can assist the user by summarizing the key insights discussed by the speaker in the video. Organize the summary into time-range sections based on the provided timestamps. Additionally, proactively offer assistance to the user by asking if they would like: 1. A more in-depth summary, 2. Generation of flashcard questions based on the video content, 3. Help finding specific timestamps related to particular topics discussed in the video. Ensure that the response is engaging and encourages the user to explore the video's content further or seek more personalized assistance. Here is the title ${ytTitle} the duration: ${duration} , and the captions + timestamps: *${captions}*`;

                    console.log("the message for GPT is", messageForGPT);

                    const newMessageForGPT = {
                        message: messageForGPT,
                        direction: 'outgoing',
                        sender: 'user',
                    };

                    setIsTyping(true);
                    await processMessageToChatGPT([...newMessages, newMessageForGPT]);
                    setIsTyping(false);
                } catch (error) {
                    console.error(error);
                }
            }

        } else {

            //---------------------------------------------------------- Normal message for GPT --- THIS WORKS !!! ----------------------------------------------------------


            setIsTyping(true);
            await processMessageToChatGPT(newMessages);
            setIsTyping(false);
        }
    };


    async function processMessageToChatGPT(chatMessages) {
        let apiMessages = chatMessages.map((messageObject) => {
            let role = "";
            if (messageObject.sender === "ChatGPT") {
                role = "assistant";
            } else {
                role = "user";
            }
            return { role: role, content: messageObject.message };
        });

        const apiRequestBody = {
            "message": apiMessages[apiMessages.length - 1].content, // Send only the latest user message
        };

        try {
            const response = await fetch("/openai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(apiRequestBody),
            });
            const data = await response.json();
            const chatGptResponse = {
                message: data.choices[0].message.content.replace(/\$/g, '\n\t'), // Replace $ with a new line and a tab
                sender: "ChatGPT",
            };
            const secondToLastMessage = chatMessages[chatMessages.length - 2];
            if (secondToLastMessage && (secondToLastMessage.message.includes('youtube.com') || secondToLastMessage.message.includes('youtu.be'))) {
                chatMessages.splice(-1, 1);
            }

            setMessages([...chatMessages, chatGptResponse]);
            setIsTyping(false);
        } catch (error) {
            console.error('Error making OpenAI request to the server:', error);
            setIsTyping(false);
        }
    }






    return (
        <div className='bg-[#070410] flex flex-col h-screen'>

            <div className='flex justify-center content-center py-6'>
                <img className='w-[8rem]' src="YTGPT.png" alt="" />
            </div>

            <div className='flex-grow overflow-auto p-4'>
                {messages.map((message, index) => (
                    <Message key={index} content={message.message} sender={message.sender} />
                ))}
                {isTyping && <div className="text-[#55bc8c] text-sm">YtGPT is typing...</div>}
            </div>

            <div className="p-4">
                <MessageInput onSend={handleSend} />
            </div>
        </div>
    )
}

export default Chat