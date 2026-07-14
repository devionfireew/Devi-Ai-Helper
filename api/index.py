from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Groq Client initialize
api_key = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

@app.route("/api/chat", methods=["POST"])
def chat():
    global client
    if not client:
        api_key = os.environ.get("GROQ_API_KEY")
        if api_key:
            client = Groq(api_key=api_key)
        else:
            return jsonify({"reply": "Backend Error: GROQ_API_KEY is missing on Vercel!"}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"reply": "No data received"}), 400

        user_message = data.get("message", "")
        chat_history = data.get("chatHistory", [])
        image_data = data.get("image")  # Base64 image data string

        formatted_messages = []
        
        # 1. Purani history format karein
        for msg in chat_history[:-1]:  # Aakhri msg skip kar rahe hain kyunki usko niche manually handle karenge
            if "role" in msg and "content" in msg:
                formatted_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        # 2. Current Request Message structure handle karein (With or Without Image)
        if image_data:
            # Agar image majood hai, to message content array format mein jayega
            current_content = [
                {
                    "type": "text",
                    "text": user_message if user_message else "Is tasveer ko hal karein aur samjhayein."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image_data  # data:image/jpeg;base64,.....
                    }
                }
            ]
            formatted_messages.append({
                "role": "user",
                "content": current_content
            })
            # Image analyze karne ke liye Vision Model use karna zaroori hai
            target_model = "llama-3.2-11b-vision-preview"
        else:
            # Normal text message
            formatted_messages.append({
                "role": "user",
                "content": user_message
            })
            target_model = "mixtral-8x7b-32768"

        # Groq API Request
        completion = client.chat.completions.create(
            model=target_model,
            messages=formatted_messages
        )
        
        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"reply": f"Python Backend Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
