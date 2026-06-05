import sys
import asyncio
from app.services.retrieval_service import retrieve_relevant_chunks

def test(project_id: str, query: str):
    print(f"Retrieving chunks for project {project_id} with query '{query}'...\n")
    results = retrieve_relevant_chunks(project_id, query, top_k=5)
    
    if not results:
        print("No chunks found.")
        return
        
    for i, r in enumerate(results):
        print(f"--- Rank {i+1} ---")
        print(f"Source: {r['source_agent']}")
        print(f"Similarity: {r['similarity']:.4f}")
        print(f"Chunk: {r['chunk_text'][:150]}...")
        print()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_retrieval.py <project_id> [query]")
        sys.exit(1)
        
    pid = sys.argv[1]
    q = sys.argv[2] if len(sys.argv) > 2 else "database schema"
    test(pid, q)
