import spacy
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Tuple

# Load spaCy model for NER and noun chunks
nlp = spacy.load("en_core_web_sm")

# Load sentence transformer for semantic similarity
try:
    similarity_model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"Warning: Could not load sentence transformer: {e}")
    similarity_model = None

# Extended stop words
STOP_WORDS = {
    "part", "thing", "something", "anything", "everything", "someone",
    "anyone", "nothing", "example", "way", "case", "point", "fact",
    "idea", "order", "problem", "question", "use", "form", "number",
    "kind", "group", "system", "place", "year", "week", "day", "time",
    "man", "men", "woman", "women", "child", "children", "people",
    "person", "name", "head", "house", "world", "country", "city",
    "state", "company", "organization", "department", "office"
}

# Relationship patterns
RELATION_PATTERNS = [
    {"label": "IS_A", "patterns": [["is", "a"], ["is", "an"], ["is", "type", "of"], ["is", "kind", "of"], ["is", "subset", "of"]]},
    {"label": "PART_OF", "patterns": [["part", "of"], ["belongs", "to"], ["component", "of"], ["module", "of"]]},
    {"label": "RELATED_TO", "patterns": [["related", "to"], ["connected", "to"], ["linked", "to"], ["associated", "with"]]},
    {"label": "USES", "patterns": [["uses"], ["uses", "a"], ["uses", "an"], ["utilizes"], ["employs"]]},
    {"label": "DEPENDS_ON", "patterns": [["depends", "on"], ["relies", "on"], ["requires"], ["needs"]]},
    {"label": "ENABLES", "patterns": [["enables"], ["allows"], ["helps"], ["facilitates"]]},
]


def extract_concepts(text: str) -> List[str]:
    """
    Extract concepts from text using noun chunks and named entities.
    """
    doc = nlp(text)
    concepts = set()
    
    # Extract named entities first (higher priority)
    for ent in doc.ents:
        if ent.label_ in ["PERSON", "ORG", "PRODUCT", "TECHNOLOGY", "EVENT", "GPE"]:
            phrase = ent.text.strip()
            if _is_valid_concept(phrase):
                concepts.add(phrase)
    
    # Extract noun chunks
    for chunk in doc.noun_chunks:
        phrase = chunk.text.strip()
        if _is_valid_concept(phrase):
            concepts.add(phrase)
    
    return list(concepts)


def _is_valid_concept(phrase: str) -> bool:
    """
    Check if a phrase is a valid concept.
    """
    # Check length
    if len(phrase) < 2 or len(phrase) > 50:
        return False
    
    # Check stop words
    if phrase.lower() in STOP_WORDS:
        return False
    
    # Check if it's mostly stop words
    words = phrase.lower().split()
    stop_word_count = sum(1 for w in words if w in STOP_WORDS)
    if stop_word_count / len(words) > 0.5:
        return False
    
    # Check for valid characters
    if not any(c.isalnum() for c in phrase):
        return False
    
    return True


def get_concept_embeddings(concepts: List[str]) -> np.ndarray:
    """
    Get embeddings for all concepts using sentence transformer.
    """
    if not similarity_model or not concepts:
        return np.array([])
    
    try:
        embeddings = similarity_model.encode(concepts, show_progress_bar=False)
        return embeddings
    except Exception as e:
        print(f"Error getting embeddings: {e}")
        return np.array([])


def calculate_similarity(embeddings: np.ndarray) -> np.ndarray:
    """
    Calculate pairwise cosine similarity between all concepts.
    """
    if embeddings.shape[0] < 2:
        return np.array([])
    
    # Normalize embeddings
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized = embeddings / (norms + 1e-8)
    
    # Compute cosine similarity
    similarity_matrix = np.dot(normalized, normalized.T)
    return similarity_matrix


def extract_relationships(text: str, concepts: List[str]) -> List[Dict[str, str]]:
    """
    Extract relationships between concepts from the text.
    """
    relationships = []
    text_lower = text.lower()
    
    # Check for pattern-based relationships
    for concept1 in concepts:
        for concept2 in concepts:
            if concept1 == concept2:
                continue
            
            # Find both concepts in text
            idx1 = text_lower.find(concept1.lower())
            idx2 = text_lower.find(concept2.lower())
            
            if idx1 == -1 or idx2 == -1:
                continue
            
            # Get text between concepts
            start = min(idx1, idx2)
            end = max(idx1, idx2)
            between_text = text_lower[start:end]
            
            # Check relation patterns
            for relation in RELATION_PATTERNS:
                for pattern in relation["patterns"]:
                    pattern_text = " ".join(pattern)
                    if pattern_text in between_text:
                        relationships.append({
                            "source": concept1,
                            "target": concept2,
                            "type": relation["label"]
                        })
                        break
    
    return relationships


def analyze_concepts(text: str) -> Dict:
    """
    Main function to analyze text and extract concepts with relationships.
    Returns concepts, embeddings, similarity matrix, and extracted relationships.
    """
    # Extract concepts
    concepts = extract_concepts(text)
    
    if not concepts:
        return {
            "concepts": [],
            "embeddings": [],
            "similarity_matrix": [],
            "relationships": []
        }
    
    # Get embeddings
    embeddings = get_concept_embeddings(concepts)
    
    # Calculate similarity matrix
    similarity_matrix = calculate_similarity(embeddings) if embeddings.size > 0 else np.array([])
    
    # Extract relationships
    relationships = extract_relationships(text, concepts)
    
    return {
        "concepts": concepts,
        "embeddings": embeddings.tolist() if embeddings.size > 0 else [],
        "similarity_matrix": similarity_matrix.tolist() if similarity_matrix.size > 0 else [],
        "relationships": relationships
    }


def lemmatize_concept(concept: str) -> str:
    """
    Get the lemma (base form) of a concept.
    """
    doc = nlp(concept)
    return " ".join([token.lemma_ for token in doc])

