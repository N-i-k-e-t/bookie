# Bookie 📖

### *Your Next Favorite Book, Chosen by AI.*
**Privacy-First • AI-Native • Zero Backend**

---

## 🌟 Vision
People don't want another list of "Top 100 Books." They want someone to say:
> *"I know where you are in life, and I think this book is exactly what you need right now."*

Bookie is an AI-powered reading companion built around a simple belief: **The right book, at the right time, can change a person's life.** It behaves like a personal reading mentor, engaging you in a short, natural conversation to understand your aspirations, mindset, and habits, then recommending a single carefully selected book with a detailed explanation of why it fits you.

---

## 🔒 Privacy by Design
Privacy is a core product feature:
- **Local AI Inference:** All Small Language Model (SLM) processing, text generation, and embeddings run locally in the browser using [Transformers.js](https://huggingface.co/docs/transformers.js).
- **On-Device Face Analysis:** Apparent facial expressions are analyzed entirely on-device using [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/face_landmarker) and discarded immediately.
- **Zero Backend:** No server, no database, no tracking. Your conversations and data never leave your browser.

---

## 🛠️ Technology Stack
- **Core:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (CSS-first configurations)
- **Animations:** Motion (formerly Framer Motion)
- **3D Graphics:** React Three Fiber (R3F) + Three.js for procedural 3D book cover rendering
- **AI Runtime:** Transformers.js v3 (WebGPU accelerated with WASM fallback)
- **SLM Model:** Qwen2.5 0.5B Instruct (quantized q4)
- **Embeddings Model:** all-MiniLM-L6-v2 (384-dimensional vector embeddings)
- **Face Analysis:** MediaPipe FaceLandmarker
- **State Management:** Zustand

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🔄 Recommendation Pipeline
```
User Name → Apparent Expression Cues (Smile, Eyebrows) → Conversation Flow (3-5 Adaptive Questions)
                      ↓
           Multidimensional Personality Profile (20 Dimensions)
                      ↓
           Sentence Transformer Embedding (all-MiniLM-L6-v2)
                      ↓
           Cosine Similarity Index Search + SLM Re-ranking (Qwen2.5)
                      ↓
           Procedural 3D Book Cover Reveal + Personal Explanation
```

---

## 📖 Book Dataset
Bookie includes a highly curated library of premium titles spanning Self-Help, Business, Psychology, Science, Philosophy, Fiction, Biography, Technology, Creativity, and Spirituality, with precomputed mappings across 20 personality dimensions.
