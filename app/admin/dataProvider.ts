import { fetchUtils, DataProvider } from 'ra-core';
import { stringify } from 'query-string';

const apiUrl = '/api';

// Enhanced httpClient with better error handling
const httpClient = async (url: string, options: any = {}) => {
  // Add Authorization header for authenticated requests
  // Default headers
  const defaultHeaders = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  
  if (!options.headers) {
    options.headers = defaultHeaders;
  } else {
    options.headers = {
      ...defaultHeaders,
      ...options.headers,
    };
  }
  
  // Add Content-Type for non-GET requests
  if (options.method && options.method !== 'GET' && !options.headers['Content-Type'] && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[httpClient] Request to ${url} timed out after 60 seconds`);
      controller.abort();
    }, 60000); // 60 second timeout - increased from 30 seconds
    
    if (!options.signal) {
      options.signal = controller.signal;
    }
    
    // Log the request details
    console.log(`[httpClient] ${options.method || 'GET'} request to: ${url}`);

  try {
    // Ensure no caching for all requests
    options.cache = 'no-store';
    options.headers = {
      ...options.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    const response = await fetch(url, options);
      
    // Clear the timeout once we get a response
    clearTimeout(timeoutId);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // Not JSON
      }
      
      // Format error message
      const errorMessage = errorJson?.error || errorJson?.message || errorText || response.statusText;
      
      console.error('API Error:', {
        status: response.status,
        message: errorMessage,
        url,
        method: options.method || 'GET'
      });
      
      throw new Error(errorMessage || `HTTP Error ${response.status}`);
    }
      
      // Check if response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // Parse JSON response
        const json = await response.json().catch(e => {
          console.error('Error parsing JSON response:', e);
          return {};
        });
    
    return { 
      status: response.status, 
      headers: response.headers,
      json 
    };
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        console.log(`[httpClient] Non-JSON response from ${url}`, text.substring(0, 100));
        return {
          status: response.status,
          headers: response.headers,
          json: {}
        };
      }
    } catch (fetchError) {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Rethrow the error to be caught by the outer try/catch
      throw fetchError;
    }
  } catch (error) {
    // Handle network errors, timeouts, and other fetch failures
    console.error(`API request failed for ${url}:`, error);
    
    if ((error as Error).name === 'AbortError') {
      console.warn(`Request to ${url} was aborted due to timeout or user cancellation`);
      throw new Error(`Request timeout for ${url}. The server took too long to respond. Please try again later.`);
    }
    
    // If the error is related to CORS, provide a more specific message
    const errorMessage = (error as Error).message || '';
    if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
      throw new Error(`CORS error accessing ${url}. Check server configuration.`);
    }
    
    if (navigator.onLine === false) {
      throw new Error('Network connection is offline. Please check your internet connection.');
    }
    
    throw error;
  }
};

async function handleImageUpload(file: File): Promise<string> {
  if (!file) {
    console.log('[handleImageUpload] No file provided, returning default image');
    return '/courses.svg'; // Default image path
  }
  
  try {
    console.log(`[handleImageUpload] Starting upload for file: ${file.name}, size: ${file.size}`);
    
    // Validate file before uploading
    if (file.size > 10 * 1024 * 1024) { // 10MB max
      console.warn('[handleImageUpload] File too large, using default image');
      return '/courses.svg';
    }
    
    if (!file.type.startsWith('image/')) {
      console.warn(`[handleImageUpload] Invalid file type: ${file.type}, using default image`);
      return '/courses.svg';
    }
    
    const formData = new FormData();
    formData.append('file', file);

    // Use fetch with timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[handleImageUpload] Image upload request timed out after 60 seconds');
      controller.abort();
    }, 60000); // 60 second timeout
    
    try {
      console.log('[handleImageUpload] Sending request to upload API');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[handleImageUpload] Upload failed with status ${response.status}:`, errorText);
        return '/courses.svg'; // Use default image if upload fails
      }

      if (!response.headers.get('content-type')?.includes('application/json')) {
        console.error('[handleImageUpload] Upload response is not JSON:', await response.text());
        return '/courses.svg';
      }

      const data = await response.json();
      
      if (!data || !data.url) {
        console.error('[handleImageUpload] Upload response missing URL:', data);
        return '/courses.svg';
      }
      
      console.log(`[handleImageUpload] Upload successful, URL: ${data.url}`);
      return data.url;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[handleImageUpload] Fetch error:', fetchError);
      
      if ((fetchError as Error).name === 'AbortError') {
        console.warn('[handleImageUpload] Upload request was aborted due to timeout');
      }
      
      return '/courses.svg'; // Use default image if there's a fetch error
    }
  } catch (error) {
    console.error('[handleImageUpload] General upload error:', error);
    return '/courses.svg'; // Use default image if there's any error
  }
}

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    // If no pagination is requested, fetch all data
    // Updated to handle cases where pagination might be undefined
    const fetchAll = !params.pagination || params.pagination?.perPage === -1 || params.pagination === false as any;
    
    // Use original pagination or override with a very large value to fetch all
    const pagination = params.pagination || { page: 1, perPage: 10 };
    const { page = 1, perPage = 10 } = fetchAll 
      ? { page: 1, perPage: 1000000 } 
      : pagination;
      
    const sort = params.sort || { field: 'id', order: 'ASC' };
    const { field = 'id', order = 'ASC' } = sort;
    
    // Add a timestamp without caching to always get fresh data
    const timestamp = new Date().getTime();
  
    const query = {
      filter: JSON.stringify(params.filter || {}),
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, (page * perPage) - 1]),
      _t: timestamp.toString(), // Add cache busting parameter
      fetchAll: fetchAll ? 'true' : 'false', // Signal to API that we want all records
    };
    
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    try {
      console.log(`[dataProvider.getList] Fetching ${resource} list, ${fetchAll ? 'ALL RECORDS (pagination disabled)' : `page ${page}, perPage ${perPage}`}`);
      
      const { json, headers } = await httpClient(url, {
        credentials: 'include',
        // The cache control headers are now set in the httpClient function
        // so we don't need to specify them here, but we'll keep the cache option
        // for extra assurance
        cache: 'no-store'
      });
      
      // Get total count from headers or fallback to length
      let totalCount = 0;
      
      const contentRange = headers.get('content-range');
      if (contentRange) {
        const parts = contentRange.split('/');
        if (parts.length > 1) {
          totalCount = parseInt(parts[1], 10);
        }
      } else if (headers.get('x-total-count')) {
        totalCount = parseInt(headers.get('x-total-count') as string, 10);
      } else if (Array.isArray(json)) {
        totalCount = json.length;
      } else if (json && typeof json === 'object' && 'total' in json) {
        totalCount = json.total;
      }
      
      console.log(`[dataProvider.getList] Resource: ${resource}, ${fetchAll ? 'ALL RECORDS' : `Page: ${page}`}, Items: ${Array.isArray(json) ? json.length : 0}, Total: ${totalCount}`);
      
      if (fetchAll) {
        console.log(`[dataProvider.getList] Successfully fetched all ${Array.isArray(json) ? json.length : 0} records for ${resource}`);
      }
      
      return {
        data: Array.isArray(json) ? json : json.data || [],
        total: totalCount || 0,
      };
    } catch (error) {
      console.error(`Error in getList for ${resource}:`, error);
      
      // Handle specific error types for better error messages
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Special handling for timeout errors
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          console.warn(`Fetch for resource ${resource} timed out or was aborted`);
          
          // Special case for fetchAll - suggest using with pagination instead
          if (fetchAll) {
            errorMessage = `Request timed out while loading all ${resource}. Try with pagination instead of loading all records.`;
          } else {
            errorMessage = `Request timed out while loading ${resource}. The server might be busy.`;
          }
        }
      }
      
      // Return empty data instead of throwing error to prevent UI crashes
      console.log(`[dataProvider.getList] Returning empty data for ${resource} due to error: ${errorMessage}`);
      return {
        data: [],
        total: 0,
        error: errorMessage
      };
    }
  },

  getOne: async (resource, params) => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = `${apiUrl}/${resource}/${params.id}?_t=${timestamp}`;
      
      const { json } = await httpClient(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      return { data: json };
    } catch (error) {
      console.error(`Error in getOne for ${resource}/${params.id}:`, error);
      throw error;
    }
  },

  create: async (resource, params) => {
    let newParams = { ...params };
    
    try {
      console.log(`[dataProvider.create] Starting creation for ${resource}`, params.data);
      
      // Handle image upload if present
      if (params.data.imageSrc && params.data.imageSrc.rawFile) {
        try {
          console.log(`[dataProvider.create] Uploading image for new ${resource}`);
          const imageUrl = await handleImageUpload(params.data.imageSrc.rawFile);
          console.log(`[dataProvider.create] Image uploaded successfully: ${imageUrl}`);
          
          // Always store imageSrc as a plain string URL
          newParams.data = {
            ...params.data,
            imageSrc: imageUrl,
          };
        } catch (imageError) {
          console.error(`[dataProvider.create] Image upload error:`, imageError);
          // Continue with default image instead of failing
          newParams.data = {
            ...params.data,
            imageSrc: '/courses.svg',
          };
        }
      } else if (params.data.imageSrc && typeof params.data.imageSrc === 'object' && params.data.imageSrc.src) {
        // Handle case where imageSrc is an object with src property
        console.log(`[dataProvider.create] Using existing image src: ${params.data.imageSrc.src}`);
        newParams.data = {
          ...params.data,
          imageSrc: params.data.imageSrc.src, // Convert to string
        };
      } else if (typeof params.data.imageSrc === 'string' && params.data.imageSrc.trim() !== '') {
        // Image is already a string, keep it as is
        console.log(`[dataProvider.create] Using existing image string: ${params.data.imageSrc}`);
        // No change needed
      } else {
        // No image provided, use default
        console.log(`[dataProvider.create] No image provided for new ${resource}, using default`);
        newParams.data = {
          ...params.data,
          imageSrc: '/courses.svg',
        };
      }

      const { json } = await httpClient(`${apiUrl}/${resource}`, {
        method: 'POST',
        body: JSON.stringify(newParams.data),
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      console.log(`[dataProvider.create] Resource: ${resource}, Created item ID: ${json.id || 'unknown'}`);
      
      return { data: json };
    } catch (error) {
      console.error(`Error in create for ${resource}:`, error);
      throw error;
    }
  },

  update: async (resource, params) => {
    let newParams = { ...params };
    let imageUrl = null;
    
    try {
      console.log(`[dataProvider.update] Updating ${resource} ID: ${params.id}`, params.data);
      
      // Handle image upload if present
      if (params.data.imageSrc && params.data.imageSrc.rawFile) {
        try {
          console.log(`[dataProvider.update] Image upload detected for ${resource} ID: ${params.id}`);
          imageUrl = await handleImageUpload(params.data.imageSrc.rawFile);
          console.log(`[dataProvider.update] Image uploaded successfully: ${imageUrl}`);
          
          // Always store imageSrc as a plain string URL
          newParams.data = {
            ...params.data,
            imageSrc: imageUrl,
          };
        } catch (imageError) {
          console.error(`[dataProvider.update] Image upload error:`, imageError);
          // Don't change the image in case of error
          newParams.data = {
            ...params.data,
            imageSrc: undefined, // Remove to avoid replacing with undefined
          };
        }
      } else if (params.data.imageSrc && typeof params.data.imageSrc === 'object' && params.data.imageSrc.src) {
        // Handle case where imageSrc is an object with src property
        console.log(`[dataProvider.update] Using existing image src: ${params.data.imageSrc.src}`);
        newParams.data = {
          ...params.data,
          imageSrc: params.data.imageSrc.src, // Convert to string
        };
      } else if (typeof params.data.imageSrc === 'string' && params.data.imageSrc.trim() !== '') {
        // Image is already a string, keep it as is
        console.log(`[dataProvider.update] Using existing image string: ${params.data.imageSrc}`);
        // No change needed
      } else if (params.data.imageSrc === undefined || params.data.imageSrc === null) {
        // imageSrc explicitly set to null/undefined - don't touch it
        console.log(`[dataProvider.update] imageSrc explicitly removed for ${resource} ID: ${params.id}`);
        // Let it pass through as is
      } else {
        // No valid image provided, remove from update to keep existing
        console.log(`[dataProvider.update] No valid image for ${resource} ID: ${params.id}, keeping existing`);
        const { imageSrc, ...dataWithoutImage } = newParams.data;
        newParams.data = dataWithoutImage;
      }

      // Implement retry logic with exponential backoff
      const maxRetries = 3;
      const executeUpdate = async () => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
          method: 'PUT',
          body: JSON.stringify(newParams.data),
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
            });
            
            console.log(`[dataProvider.update] Resource: ${resource}, Updated item ID: ${json.id || params.id || 'unknown'}`);
            
            return { data: json };
          } catch (error) {
            if (attempt === maxRetries) {
              console.error(`[dataProvider.update] All ${maxRetries} attempts failed for ${resource}/${params.id}:`, error);
              throw error;
            }
            
            console.warn(`[dataProvider.update] Attempt ${attempt} failed for ${resource}/${params.id}, retrying in ${500 * attempt}ms`);
            await new Promise(resolve => setTimeout(resolve, 500 * attempt)); // Exponential backoff
          }
        }
        
        // This should never happen due to the throw in the catch block above
        throw new Error(`All ${maxRetries} update attempts failed`);
      };
      
      return await executeUpdate();
    } catch (error) {
      console.error(`[dataProvider.update] Error updating ${resource}/${params.id}:`, error);
      throw error;
    }
  },

  delete: async (resource, params) => {
    try {
      const timestamp = new Date().getTime();
      // Use RESTful URL format
      const url = `${apiUrl}/${resource}/${params.id}?_t=${timestamp}`;
      
      console.log(`[dataProvider.delete] Deleting ${resource} with ID: ${params.id}`);
      
      const { json } = await httpClient(url, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      console.log(`[dataProvider.delete] Resource: ${resource}, Deleted item ID: ${params.id}`);
      
      return { data: json || { id: params.id } };
    } catch (error) {
      console.error(`Error in delete for ${resource}/${params.id}:`, error);
      throw error;
    }
  },

  deleteMany: async (resource, params) => {
    try {
      const query = {
        filter: JSON.stringify({ id: params.ids }),
      };
      const { json } = await httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
        method: 'DELETE',
      });
      return { data: json || params.ids };
    } catch (error) {
      console.error(`Error in deleteMany for ${resource}:`, error);
      throw error;
    }
  },

  getMany: async (resource, params) => {
    try {
      if (!params.ids || !params.ids.length) {
        console.log(`[dataProvider.getMany] No IDs provided for ${resource}, returning empty array`);
        return { data: [] };
      }
      
      console.log(`[dataProvider.getMany] Fetching ${resource} with IDs:`, params.ids);
      
      const query = {
        filter: JSON.stringify({ id: params.ids }),
      };
      const url = `${apiUrl}/${resource}?${stringify(query)}`;
      
      const { json } = await httpClient(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      console.log(`[dataProvider.getMany] Successfully fetched ${resource}:`, json);
      return { data: Array.isArray(json) ? json : [] };
    } catch (error) {
      console.error(`Error in getMany for ${resource}:`, error);
      
      // Return empty data instead of throwing error to prevent UI crashes
      return { data: [] };
    }
  },

  getManyReference: async (resource, params) => {
    try {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      
      console.log(`[dataProvider.getManyReference] Fetching ${resource} with reference ${params.target}=${params.id}`);
      
      // Add a timestamp for cache busting
      const timestamp = new Date().getTime();
      
      const query = {
        sort: JSON.stringify([field, order]),
        range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
        filter: JSON.stringify({
          ...params.filter,
          [params.target]: params.id,
        }),
        _t: timestamp.toString(), // Add cache busting parameter
      };
      
      const url = `${apiUrl}/${resource}?${stringify(query)}`;
      
      const { json, headers } = await httpClient(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      // Get total count from headers
      let totalCount = 0;
      
      const contentRange = headers.get('content-range');
      if (contentRange) {
        const parts = contentRange.split('/');
        if (parts.length > 1) {
          totalCount = parseInt(parts[1], 10);
        }
      } else if (headers.get('x-total-count')) {
        totalCount = parseInt(headers.get('x-total-count') as string, 10);
      } else if (Array.isArray(json)) {
        totalCount = json.length;
      } else if (json && typeof json === 'object' && 'total' in json) {
        totalCount = json.total;
      }
      
      console.log(`[dataProvider.getManyReference] Successfully fetched ${resource} references, count: ${totalCount}`);
      
      return {
        data: Array.isArray(json) ? json : (json.data || []),
        total: totalCount || 0,
      };
    } catch (error) {
      console.error(`Error in getManyReference for ${resource}:`, error);
      
      // Return empty data instead of throwing error to prevent UI crashes
      return {
        data: [],
        total: 0,
      };
    }
  },

  updateMany: async (resource, params) => {
    try {
      const query = {
        filter: JSON.stringify({ id: params.ids }),
      };
      const { json } = await httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
        method: 'PUT',
        body: JSON.stringify(params.data),
      });
      return { data: json || params.ids };
    } catch (error) {
      console.error(`Error in updateMany for ${resource}:`, error);
      throw error;
    }
  },
};