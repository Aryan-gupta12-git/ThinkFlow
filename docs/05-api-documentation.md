# API Documentation

ThinkFlow's backend exposes a modular rest API under the `/api` sub-prefix. All request and response bodies use JSON.

---

## 📌 Endpoint: `POST /api/topics`

Generates a single, professional, unique public speaking or interview topic.

### Headers
```http
Content-Type: application/json
```

### Request Body
```json
{
  "exclude": ["List", "of", "topic", "texts", "to", "avoid", "repeating"]
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "topic": "Should artificial intelligence be granted legal personality?"
}
```

### Error Response (`500 Internal Server Error`)
```json
{
  "success": false,
  "message": "Unable to generate topic.",
  "error": "Error details trace string..."
}
```

### Example Curl Request
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"exclude":["Should AI replace teachers?"]}' \
  http://localhost:3001/api/topics
```

---

## 📌 Endpoint: `POST /api/analyze`

Performs deep qualitative AI evaluation and analysis of the practice transcript or text.

### Headers
```http
Content-Type: application/json
```

### Request Body
```json
{
  "mode": "random-topic" | "introduce-yourself" | "speech-practice",
  "topic": "The practice session topic text",
  "content": "The text written or spoken by the user"
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "isTooShort": false,
  "shortMessage": "",
  "summary": "Overall assessment of communication quality...",
  "strengths": [
    "List of 3 to 5 clear strengths..."
  ],
  "improvements": [
    "List of 3 to 5 clear areas of improvements..."
  ],
  "grammarCorrections": [
    {
      "original": "Sentence containing mistakes",
      "corrected": "Polished correct sentence",
      "explanation": "Brief description of why the change was made"
    }
  ],
  "improvedVersion": "A polished version of the user's transcript...",
  "suggestions": [
    "Exactly 5 actionable tips..."
  ]
}
```

### Response: Too Short (`200 OK`)
If the content is under 15-20 words, the backend returns:
```json
{
  "success": true,
  "isTooShort": true,
  "shortMessage": "That's a good start! Please try to write or speak a longer response to get detailed feedback.",
  "summary": "",
  "strengths": [],
  "improvements": [],
  "grammarCorrections": [],
  "improvedVersion": "",
  "suggestions": []
}
```

### Error Response (`400 Bad Request`)
If body properties are missing or validation fails:
```json
{
  "success": false,
  "message": "Invalid request: \"content\" is a required string."
}
```

### Example Curl Request
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "mode": "speech-practice",
    "topic": "Is AI replacing creativity?",
    "content": "Well, in my opinion AI is a tool rather than replacing humans."
  }' \
  http://localhost:3001/api/analyze
```
