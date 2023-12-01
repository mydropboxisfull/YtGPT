import React from 'react';

const Message = ({ content, sender }) => {
    return (
        <div className=''>


            <div className={`flex ${sender === "ChatGPT" ? "justify-start" : "justify-end"} mb-2`}>
                <div
                    className={`message-content rounded p-2 ${sender === "ChatGPT" ? "bg-[#2c3452]  text-gray-200" : "bg-[#55bb8d] text-[#070410]"}`}
                    style={{ maxWidth: "70%" }}
                >
                    {content}
                </div>
            </div>
        </div>
    );
};

export default Message;
