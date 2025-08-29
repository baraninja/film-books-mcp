// Utility functions for deduplicating search results across different sources

interface BookResult {
  source: string;
  results: any;
  error?: string;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')     // Normalize spaces
    .trim();
}

function normalizeAuthor(author: string): string {
  return author
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBookInfo(item: any, source: string): { title: string; authors: string[]; isbn?: string } | null {
  try {
    let title = '';
    let authors: string[] = [];
    let isbn: string | undefined;

    switch (source) {
      case 'Google Books':
        if (item.volumeInfo) {
          title = item.volumeInfo.title || '';
          authors = item.volumeInfo.authors || [];
          isbn = item.volumeInfo.industryIdentifiers?.find((id: any) => 
            id.type === 'ISBN_13' || id.type === 'ISBN_10'
          )?.identifier;
        }
        break;
        
      case 'Open Library':
        title = item.title || '';
        authors = item.author_name || [];
        isbn = item.isbn?.[0];
        break;
        
      case 'LIBRIS (Swedish National Library)':
        // LIBRIS structure varies, try to extract basic info
        if (item.title) {
          title = Array.isArray(item.title) ? item.title[0] : item.title;
        }
        if (item.author) {
          authors = Array.isArray(item.author) ? item.author : [item.author];
        }
        isbn = item.isbn?.[0];
        break;
    }

    if (!title) return null;

    return {
      title: normalizeTitle(title),
      authors: authors.map(normalizeAuthor),
      isbn
    };
  } catch {
    return null;
  }
}

function calculateSimilarity(book1: ReturnType<typeof extractBookInfo>, book2: ReturnType<typeof extractBookInfo>): number {
  if (!book1 || !book2) return 0;

  let score = 0;

  // ISBN match is very strong indicator
  if (book1.isbn && book2.isbn && book1.isbn === book2.isbn) {
    return 0.95;
  }

  // Title similarity (Levenshtein distance approximation)
  const titleSimilarity = calculateStringSimilarity(book1.title, book2.title);
  score += titleSimilarity * 0.7;

  // Author similarity
  let authorSimilarity = 0;
  if (book1.authors.length > 0 && book2.authors.length > 0) {
    const commonAuthors = book1.authors.filter(a1 => 
      book2.authors.some(a2 => calculateStringSimilarity(a1, a2) > 0.8)
    );
    authorSimilarity = commonAuthors.length / Math.max(book1.authors.length, book2.authors.length);
  }
  score += authorSimilarity * 0.3;

  return score;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export function deduplicateBookResults(searchResults: BookResult[], similarityThreshold: number = 0.8): BookResult[] {
  const deduplicatedResults: BookResult[] = [];
  const processedBooks: Array<{
    book: ReturnType<typeof extractBookInfo>;
    originalItem: any;
    source: string;
    sourceIndex: number;
  }> = [];

  // Extract all books with metadata
  for (const result of searchResults) {
    if (result.error || !result.results) {
      deduplicatedResults.push(result);
      continue;
    }

    let items: any[] = [];
    
    // Extract items based on source structure
    if (result.source === 'Google Books' && result.results.items) {
      items = result.results.items;
    } else if (result.source === 'Open Library' && result.results.docs) {
      items = result.results.docs;
    } else if (result.source === 'LIBRIS (Swedish National Library)' && result.results.list) {
      items = result.results.list;
    }

    for (const item of items) {
      const bookInfo = extractBookInfo(item, result.source);
      if (bookInfo) {
        processedBooks.push({
          book: bookInfo,
          originalItem: item,
          source: result.source,
          sourceIndex: deduplicatedResults.length
        });
      }
    }

    deduplicatedResults.push({
      ...result,
      results: { ...result.results, items: [], docs: [], list: [] } // Empty initially
    });
  }

  // Group similar books
  const groups: Array<Array<typeof processedBooks[0]>> = [];
  const used = new Set<number>();

  for (let i = 0; i < processedBooks.length; i++) {
    if (used.has(i)) continue;
    
    const group = [processedBooks[i]];
    used.add(i);

    for (let j = i + 1; j < processedBooks.length; j++) {
      if (used.has(j)) continue;
      
      const similarity = calculateSimilarity(processedBooks[i].book, processedBooks[j].book);
      if (similarity >= similarityThreshold) {
        group.push(processedBooks[j]);
        used.add(j);
      }
    }

    groups.push(group);
  }

  // Add deduplicated items back to results
  for (const group of groups) {
    // Prefer results in order: Google Books, Open Library, LIBRIS
    const priority: Record<string, number> = { 
      'Google Books': 3, 
      'Open Library': 2, 
      'LIBRIS (Swedish National Library)': 1 
    };
    const best = group.sort((a, b) => (priority[b.source] || 0) - (priority[a.source] || 0))[0];
    
    // Add the best item to its corresponding result
    const resultIndex = best.sourceIndex;
    const targetResult = deduplicatedResults[resultIndex];
    
    if (best.source === 'Google Books') {
      if (!targetResult.results.items) targetResult.results.items = [];
      targetResult.results.items.push(best.originalItem);
    } else if (best.source === 'Open Library') {
      if (!targetResult.results.docs) targetResult.results.docs = [];
      targetResult.results.docs.push(best.originalItem);
    } else if (best.source === 'LIBRIS (Swedish National Library)') {
      if (!targetResult.results.list) targetResult.results.list = [];
      targetResult.results.list.push(best.originalItem);
    }
  }

  // Add metadata about deduplication
  for (const result of deduplicatedResults) {
    if (!result.error && result.results) {
      const originalCount = result.results.totalItems || result.results.numFound || result.results.total_found || 'unknown';
      const newCount = (result.results.items?.length || 0) + (result.results.docs?.length || 0) + (result.results.list?.length || 0);
      
      result.results.deduplication = {
        original_count: originalCount,
        deduplicated_count: newCount,
        removed_duplicates: typeof originalCount === 'number' ? originalCount - newCount : 'unknown'
      };
    }
  }

  return deduplicatedResults;
}