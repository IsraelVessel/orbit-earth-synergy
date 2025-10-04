// NASA Open API Service
// Documentation: https://api.nasa.gov/

const NASA_API_KEY = 'DEMO_KEY'; // Public demo key - consider getting your own at api.nasa.gov

interface NASAImageAsset {
  href: string;
  render?: string;
}

interface NASASearchResult {
  data: Array<{
    title: string;
    description: string;
    date_created: string;
    keywords?: string[];
    nasa_id: string;
  }>;
  links?: NASAImageAsset[];
}

export interface SpaceBiologyPublication {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  link: string;
}

/**
 * NASA Image and Video Library API
 * Search for space biology, Earth observation, and other NASA content
 */
export async function searchNASALibrary(query: string, mediaType = 'image'): Promise<NASASearchResult[]> {
  try {
    const response = await fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=${mediaType}`
    );
    
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.collection.items || [];
  } catch (error) {
    console.error('Error fetching from NASA Library:', error);
    return [];
  }
}

/**
 * Get APOD (Astronomy Picture of the Day)
 */
export async function getAPOD(date?: string) {
  try {
    const url = date 
      ? `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`
      : `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`APOD API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching APOD:', error);
    return null;
  }
}

/**
 * Fetch space biology publications from NASA
 * Uses NASA Image Library with space biology keywords
 */
export async function getSpaceBiologyPublications(): Promise<SpaceBiologyPublication[]> {
  try {
    const queries = [
      'space biology',
      'microgravity research',
      'astrobiology',
      'space medicine',
      'lunar biology',
      'Mars biology'
    ];
    
    const allResults: SpaceBiologyPublication[] = [];
    
    for (const query of queries) {
      const results = await searchNASALibrary(query, 'image');
      
      results.slice(0, 3).forEach((item) => {
        if (item.data && item.data[0]) {
          const data = item.data[0];
          allResults.push({
            id: data.nasa_id,
            title: data.title,
            description: data.description || 'No description available',
            date: new Date(data.date_created).toLocaleDateString(),
            category: query,
            link: `https://images.nasa.gov/details/${data.nasa_id}`
          });
        }
      });
    }
    
    return allResults;
  } catch (error) {
    console.error('Error fetching space biology publications:', error);
    return [];
  }
}
