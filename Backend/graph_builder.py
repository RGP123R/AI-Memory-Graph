import networkx as nx
import numpy as np
from typing import List, Dict, Tuple

# Similarity threshold for creating edges
SIMILARITY_THRESHOLD = 0.3


def build_graph(concept_data: Dict) -> Dict:
    """
    Build a knowledge graph from extracted concepts using semantic similarity.
    
    Args:
        concept_data: Dictionary containing:
            - concepts: List of concept strings
            - similarity_matrix: 2D numpy array of similarity scores
            - relationships: List of extracted relationships
    
    Returns:
        Dictionary with nodes and edges for visualization
    """
    concepts = concept_data.get("concepts", [])
    similarity_matrix = concept_data.get("similarity_matrix", [])
    relationships = concept_data.get("relationships", [])
    
    if not concepts:
        return {"nodes": [], "edges": []}
    
    G = nx.Graph()
    
    # Add nodes
    for i, concept in enumerate(concepts):
        G.add_node(i, label=concept)
    
    # Add edges based on relationships first
    relationship_edges = set()
    for rel in relationships:
        try:
            source_idx = concepts.index(rel["source"])
            target_idx = concepts.index(rel["target"])
            G.add_edge(source_idx, target_idx, 
                      type=rel["type"], 
                      weight=1.0,
                      label=rel["type"])
            relationship_edges.add((min(source_idx, target_idx), max(source_idx, target_idx)))
        except ValueError:
            continue
    
    # Add edges based on similarity if not already connected
    if similarity_matrix and len(similarity_matrix) > 0:
        sim_array = np.array(similarity_matrix)
        
        # Get upper triangle indices (excluding diagonal)
        rows, cols = np.triu_indices(len(concepts), k=1)
        
        for i, j in zip(rows, cols):
            similarity = sim_array[i, j]
            
            # Skip if already connected by relationship
            if (i, j) in relationship_edges:
                continue
            
            # Add edge if similarity exceeds threshold
            if similarity >= SIMILARITY_THRESHOLD:
                G.add_edge(i, j, 
                          type="SIMILAR",
                          weight=similarity,
                          label=f"{similarity:.2f}")
    
    # Convert to visualization format
    nodes = [{"id": str(node_id), "label": data["label"]} 
             for node_id, data in G.nodes(data=True)]
    
    edges = []
    for u, v, data in G.edges(data=True):
        edge = {
            "source": str(u),
            "target": str(v),
            "type": data.get("type", "RELATED"),
            "weight": data.get("weight", 0.5)
        }
        if "label" in data and data["label"]:
            edge["label"] = data["label"]
        edges.append(edge)
    
    return {"nodes": nodes, "edges": edges}


def build_simple_graph(concepts: List[str]) -> Dict:
    """
    Build a simple graph (backward compatibility).
    Creates a complete graph for a small number of concepts.
    """
    G = nx.Graph()
    
    for i, concept in enumerate(concepts):
        G.add_node(i, label=concept)
    
    # For small concept sets, create a more connected graph
    n = len(concepts)
    if n <= 5:
        # Complete graph for very small sets
        for i in range(n):
            for j in range(i + 1, n):
                G.add_edge(i, j, type="RELATED", weight=0.5)
    elif n <= 10:
        # Chain + some cross connections
        for i in range(n - 1):
            G.add_edge(i, i + 1, type="RELATED", weight=0.6)
        # Add random cross connections
        import random
        random.seed(42)
        for _ in range(n // 2):
            i, j = random.sample(range(n), 2)
            if not G.has_edge(i, j):
                G.add_edge(i, j, type="RELATED", weight=0.3)
    
    nodes = [{"id": str(node_id), "label": data["label"]} 
             for node_id, data in G.nodes(data=True)]
    
    edges = [{"source": str(u), "target": str(v), "type": data.get("type", "RELATED")}
             for u, v, data in G.edges(data=True)]
    
    return {"nodes": nodes, "edges": edges}


def get_graph_statistics(graph: Dict) -> Dict:
    """
    Get statistics about the generated graph.
    """
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    
    if not nodes:
        return {"node_count": 0, "edge_count": 0, "density": 0}
    
    n = len(nodes)
    max_edges = n * (n - 1) / 2
    edge_count = len(edges)
    
    return {
        "node_count": n,
        "edge_count": edge_count,
        "density": edge_count / max_edges if max_edges > 0 else 0,
        "relationship_types": list(set(e.get("type", "RELATED") for e in edges))
    }

