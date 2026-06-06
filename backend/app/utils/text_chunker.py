"""
MASDP Backend — Text Chunker Utility.

Splits text into chunks suitable for embedding and retrieval.
"""

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
    """
    Splits text into overlapping chunks of approximate chunk_size characters.
    
    Args:
        text: The source text to split.
        chunk_size: Target maximum characters per chunk.
        overlap: Number of characters to overlap between chunks.
        
    Returns:
        List of non-empty text chunks.
    """
    if not text or not text.strip():
        return []

    text = text.strip()
    chunks = []
    
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = min(start + chunk_size, text_length)
        
        # If we are not at the end of the text, try to find a clean boundary
        if end < text_length:
            # Look backwards from 'end' for a clean break
            # within the last 20% of the chunk
            window_start = max(start, end - int(chunk_size * 0.2))
            window = text[window_start:end]
            
            clean_break_offset = window.rfind('\n\n')
            if clean_break_offset == -1:
                clean_break_offset = window.rfind('\n')
            if clean_break_offset == -1:
                clean_break_offset = window.rfind('. ')
            if clean_break_offset == -1:
                clean_break_offset = window.rfind(' ')
                
            if clean_break_offset != -1:
                # We found a boundary, slice exactly up to it (inclusive of the space/newline)
                end = window_start + clean_break_offset + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
            
        if end >= text_length:
            break
            
        # Move start forward for the next chunk
        start = end - overlap

    return chunks
