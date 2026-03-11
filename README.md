# Memmory - AI Memory Graph

An intelligent web application that generates interactive knowledge graphs from text using advanced Natural Language Processing (NLP) techniques. Extract concepts, analyze relationships, and visualize connections between ideas.

![Project Preview](https://via.placeholder.com/800x400?text=Memmory+AI+Memory+Graph)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## ✨ Features

- **Concept Extraction**: Automatically extract key concepts from any text using spaCy NLP
- **Knowledge Graph Generation**: Build interactive knowledge graphs showing relationships between concepts
- **Semantic Similarity**: Use state-of-the-art sentence transformers to find semantically related concepts
- **Interactive Visualization**: Explore your knowledge graph with zoom, pan, and drag functionality
- **Real-time Processing**: Fast API responses for seamless user experience
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## 🛠 Tech Stack

### Backend

| Technology                | Purpose                                                   |
| ------------------------- | --------------------------------------------------------- |
| **FastAPI**               | Modern Python web framework for building APIs             |
| **spaCy**                 | Industrial-strength NLP for NER and noun chunk extraction |
| **Sentence Transformers** | Semantic similarity using transformer models              |
| **NetworkX**              | Graph manipulation and analysis                           |
| **Uvicorn**               | ASGI server for running FastAPI                           |
| **Pydantic**              | Data validation using Python type annotations             |

### Frontend

| Technology         | Purpose                                |
| ------------------ | -------------------------------------- |
| **Next.js 16**     | React framework with App Router        |
| **React 19**       | UI library for building the interface  |
| **Tailwind CSS 4** | Utility-first CSS framework            |
| **Radix UI**       | Accessible UI primitives               |
| **D3.js**          | Data visualization for graph rendering |
| **Lucide React**   | Icon library                           |
| **TypeScript**     | Type-safe JavaScript                   |

## 📁 Project Structure

```
Memmory/
├── Backend/
│   ├── main.py              # FastAPI application & endpoints
│   ├── nlp_processor.py     # NLP processing (concept extraction, similarity)
│   ├── graph_builder.py     # Knowledge graph construction
│   └── requirements.txt     # Python dependencies
│
├── Frontend/
│   ├── app/
│   │   ├── page.tsx         # Main application page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   │
│   ├── components/
│   │   ├── input-panel.tsx   # Text input component
│   │   ├── concepts-panel.tsx # Extracted concepts display
│   │   ├── graph-panel.tsx   # Interactive graph visualization
│   │   └── header.tsx        # Application header
│   │
│   ├── components/ui/       # Radix UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── public/              # Static assets
│   └── package.json         # Node.js dependencies
│
├── README.md                 # This file
└── TODO.md                   # Project tasks
```

## 🔧 Prerequisites

Before running this project, ensure you have the following installed:

### Backend

- **Python 3.9+** - [Download Python](https://www.python.org/downloads/)
- **pip** - Python package manager (comes with Python)

### Frontend

- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **pnpm** - Fast, disk space efficient package manager
  ```bash
  npm install -g pnpm
  ```

### System Requirements

- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

## 📥 Installation

### 1. Clone the Repository

```bash
cd Memmory
```

### 2. Backend Setup

Navigate to the Backend directory and create a virtual environment:

```bash
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy English model
python -m spacy download en_core_web_sm
```

### 3. Frontend Setup

Navigate to the Frontend directory and install dependencies:

```bash
cd Frontend

# Install dependencies using pnpm
pnpm install
```

## 🚀 Running the Project

You need to run both the backend and frontend servers simultaneously.

### Start the Backend Server

Open a new terminal:

```bash
cd Backend
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux

python main.py
```

The backend server will start at: **http://localhost:8000**

### Start the Frontend Server

Open a new terminal:

```bash
cd Frontend
pnpm dev
```

The frontend application will be available at: **http://localhost:3000**

## 📚 API Documentation

Once the backend server is running, visit the interactive API docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

#### 1. Health Check

```
GET /
GET /health
```

Returns the API status and version.

#### 2. Generate Knowledge Graph

```
POST /generate-graph
```

**Request Body:**

```json
{
  "text": "Your input text here...",
  "use_semantic": true
}
```

**Response:**

```json
{
  "concepts": ["Concept1", "Concept2", ...],
  "graph": {
    "nodes": [
      {"id": "0", "label": "Concept1"},
      {"id": "1", "label": "Concept2"}
    ],
    "edges": [
      {"source": "0", "target": "1", "type": "SIMILAR", "weight": 0.85}
    ]
  },
  "statistics": {
    "node_count": 10,
    "edge_count": 15,
    "density": 0.33,
    "relationship_types": ["SIMILAR", "IS_A", "PART_OF"]
  },
  "success": true
}
```

#### 3. Extract Concepts Only

```
POST /extract-concepts
```

**Request Body:**

```json
{
  "text": "Your input text here...",
  "use_semantic": true
}
```

**Response:**

```json
{
  "concepts": ["Concept1", "Concept2", ...],
  "count": 5
}
```

## 📖 Usage Guide

1. **Open the Application**: Navigate to http://localhost:3000 in your browser

2. **Enter Text**: Type or paste any text into the input panel on the left side

3. **Generate Graph**: Click the "Generate Graph" button

4. **Explore Results**:
   - View extracted concepts in the concepts panel
   - Interact with the knowledge graph:
     - **Pan**: Click and drag the canvas
     - **Zoom**: Use mouse wheel or pinch gesture
     - **Drag Nodes**: Click and drag individual nodes to rearrange
     - **Hover**: Hover over nodes/edges to see details

5. **Adjust Settings**: Toggle semantic similarity on/off using the checkbox

## ⚙️ Configuration

### Backend Configuration

Environment variables can be set in a `.env` file in the Backend directory:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# NLP Configuration
SIMILARITY_THRESHOLD=0.3
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

### Frontend Configuration

The frontend can be configured via environment variables in `Frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔍 Troubleshooting

### Common Issues

#### 1. spaCy Model Not Found

```
OSError: [E050] Can't find model 'en_core_web_sm'
```

**Solution**: Run `python -m spacy download en_core_web_sm`

#### 2. Port Already in Use

```
ERROR: [Errno 10048] Only one usage of each socket address
```

**Solution**: Kill the process using the port or change the port in main.py

#### 3. CORS Errors

If you see CORS errors in the browser console, the backend is configured to allow all origins for development. If issues persist, check the CORS configuration in `main.py`.

#### 4. Frontend Build Errors

```bash
# Clear node_modules and reinstall
cd Frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 5. Memory Issues with Large Text

If processing very long texts, consider:

- Reducing text length (max 10,000 characters supported)
- Disable semantic similarity for faster processing

### Getting Help

If you encounter any other issues:

1. Check the console output for error messages
2. Ensure all dependencies are properly installed
3. Verify both servers are running on the correct ports

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using FastAPI, spaCy, Next.js, and D3.js
