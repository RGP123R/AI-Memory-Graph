from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import Optional, List
import logging
import sys
import os
from dotenv import load_dotenv
from fastapi import Depends
import spacy  # for healthcheck
from nlp_processor import nlp, similarity_model

load_dotenv()  # Load .env

class Settings(BaseSettings):
    frontend_url: str = "http://localhost:3000"
    log_level: str = "INFO"

settings = Settings()

# Production logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Import modules (after deps loaded)
try:
    from nlp_processor import analyze_concepts, extract_concepts
    from graph_builder import build_graph, get_graph_statistics
except ImportError as e:
    logger.error(f"Failed to import modules: {e}")
    raise

app = FastAPI(
    title="AI Memory Graph API",
    description="API for generating knowledge graphs from text",
    version="1.0.0"
)

# Secure CORS from env
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization", "X-Requested-With"],
)


class TextInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Input text for concept extraction")
    use_semantic: bool = Field(default=True, description="Use semantic similarity for graph generation")


class GraphResponse(BaseModel):
    concepts: List[str]
    graph: dict
    statistics: dict
    success: bool = True
    message: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    dependencies: dict


@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0", dependencies={})


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0", dependencies={})


@app.get("/ready", response_model=HealthResponse)
async def ready_check():
    """Production readiness check."""
    try:
        # Test spacy
        doc = nlp("test")
        spacy_ok = bool(doc.ents)
        
        # Test sentence transformer if available
        from nlp_processor import similarity_model
        st_ok = similarity_model is not None
        
        deps = {
            "spacy": spacy_ok,
            "sentence_transformer": st_ok
        }
        
        status = "ready" if all([spacy_ok, st_ok]) else "degraded"
        
        logger.info(f"Readiness check: {deps}")
        return HealthResponse(status=status, version="1.0.0", dependencies=deps)
        
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(status_code=503, detail="Service not ready")


@app.post("/generate-graph", response_model=GraphResponse)
async def generate_graph(data: TextInput):
    """
    Generate a knowledge graph from input text.
    
    - **text**: Input text to analyze
    - **use_semantic**: Whether to use semantic similarity (default: True)
    """
    try:
        logger.info(f"Processing request with text length: {len(data.text)}")
        
        # Validate input
        if not data.text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text cannot be empty"
            )
        
        # Analyze concepts
        concept_data = analyze_concepts(data.text)
        
        concepts = concept_data.get("concepts", [])
        
        if not concepts:
            logger.warning("No concepts extracted from text")
            return GraphResponse(
                concepts=[],
                graph={"nodes": [], "edges": []},
                statistics={"node_count": 0, "edge_count": 0, "density": 0},
                success=True,
                message="No concepts found in the text. Try adding more descriptive content."
            )
        
        logger.info(f"Extracted {len(concepts)} concepts")
        
        # Build graph
        if data.use_semantic and concept_data.get("similarity_matrix"):
            graph = build_graph(concept_data)
        else:
            from graph_builder import build_simple_graph
            graph = build_simple_graph(concepts)
        
        # Get statistics
        statistics = get_graph_statistics(graph)
        
        logger.info(f"Generated graph with {len(graph['nodes'])} nodes and {len(graph['edges'])} edges")
        
        return GraphResponse(
            concepts=concepts,
            graph=graph,
            statistics=statistics,
            success=True,
            message=None
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/extract-concepts")
async def extract_only(data: TextInput):
    """Extract concepts without generating graph."""
    try:
        concepts = extract_concepts(data.text)
        return {
            "concepts": concepts,
            "count": len(concepts)
        }
    except Exception as e:
        logger.error(f"Error extracting concepts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Remove dev server for hosting (use gunicorn/Procfile)

