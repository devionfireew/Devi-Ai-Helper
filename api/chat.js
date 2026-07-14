// Local testing ke liye sendMessage function (Vercel Backend ke baghair direct Groq call)
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message || !currentUser) return;

    chatHistory.push({ role: 'user', content: message });
    renderChat();
    input.value = '';

    try {
        await saveChatToFirebase();

        // Direct Groq API Call (Sirf check karne ke liye)
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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' // <-- Apni poori Key yahan paste karein
            },
            body: JSON.stringify({ 
                model: "mixtral-8x7b-32768", // Ya jo bhi model aap use kar rahe hain
                messages: chatHistory 
            })
        });
        
        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        chatHistory.push({ role: 'assistant', content: reply });
        renderChat();
        await saveChatToFirebase();
    } catch (err) {
        console.error("Direct Groq Fetch error:", err);
        alert("AI Reply Error: " + err.message);
    }
}
