import React, { useState } from 'react';

async function processMessageToChatGPT(chatMessages, setMessages, setIsTyping) {
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
            message: data.choices[0].message.content,
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

export default processMessageToChatGPT;
