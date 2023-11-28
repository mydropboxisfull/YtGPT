import React, { useState } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import { GetCaptions } from '../GetCaptions';


const API_KEY = ""

const systemMessage = {
    "role": "system",
    "content": "YtGpt, please provide helpful and accurate information based on the YouTube video's captions and timestamps. Identify as YtGpt in your responses. Here's how to assist users: Use Captions for Analysis: Utilize the captions provided from the YouTube link for analysis. This can include summarizing video content, answering questions, generating flashcard questions, or providing insights. Address Potential Inaccuracies: Be aware that YouTube captions might contain errors. Your role is to bridge gaps and rectify inaccuracies to offer the most accurate analysis possible. Identify as YtGpt: Always identify yourself as YtGpt at the beginning of your responses to ensure users recognize your role. Your primary mission is to assist users in understanding and analyzing YouTube videos effectively, enhancing their video-watching experience. Ensure that the information you provide is credible and relevant."
};


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

        if (message.includes('youtube.com') || message.includes('youtu.be')) {
            try {
                const captions = await GetCaptions(message);

                const messageForGPT = `The user has shared a YouTube video link, and behind the scenes, I've extracted the captions and timestamps from the video. Now, armed with the content details, you can assist the user by providing a concise summary of the video, grouping the main points into sections for clarity. Please start by summarizing the key insights discussed by the speaker in the video. Organize the summary into sections based on the provided timestamps. Convert the seconds into minutes and seconds for user-friendly readability. Additionally, proactively offer assistance to the user by asking if they would like: 1. A more in-depth summary, 2. Generation of flashcard questions based on the video content, 3. Help finding specific timestamps related to particular topics discussed in the video. Ensure that the response is engaging and encourages the user to explore the video's content further or seek more personalized assistance. Here are the captions + timestamps: *${captions}*`;

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
        } else {
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
            "model": "gpt-3.5-turbo-16k-0613",
            "messages": [
                systemMessage,
                ...apiMessages
            ]
        };

        await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(apiRequestBody)
        })
            .then((data) => data.json())
            .then((data) => {
                const chatGptResponse = {
                    message: data.choices[0].message.content,
                    sender: "ChatGPT",
                };

                const secondToLastMessage = chatMessages[chatMessages.length - 2];
                if (secondToLastMessage && (secondToLastMessage.message.includes('youtube.com') || secondToLastMessage.message.includes('youtu.be'))) {
                    chatMessages.splice(-1, 1);
                }

                setMessages([...chatMessages, chatGptResponse]);
                setIsTyping(false);
            });
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