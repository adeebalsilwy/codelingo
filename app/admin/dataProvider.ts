import { fetchUtils, DataProvider } from 'ra-core';
import { stringify } from 'query-string';

const apiUrl = '/api';

// Enhanced httpClient with better error handling
const httpClient = async (url: string, options: any = {}) => {
  // Add Authorization header for authenticated requests
  // Default headers
  const defaultHeaders = {
    Accept: 'application/json',
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
    const response = await fetch(url, options);
    
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
      
      throw new Error(errorMessage);
    }
    
    // Parse JSON
    const json = await response.json().catch(() => ({}));
    
    return { 
      status: response.status, 
      headers: response.headers,
      json 
    };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

async function handleImageUpload(file: File): Promise<string> {
  if (!file) return '';
  
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image upload failed:', errorText);
      throw new Error('Failed to upload image: ' + errorText);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    try {
      const { json, headers } = await httpClient(url);
      
      // Get total count from headers or fallback to length
      const contentRange = headers.get('content-range');
      const totalCount = contentRange
        ? parseInt(contentRange.split('/')[1], 10)
        : headers.get('x-total-count')
        ? parseInt(headers.get('x-total-count') as string, 10)
        : Array.isArray(json) 
        ? json.length 
        : 0;
        
      return {
        data: Array.isArray(json) ? json : json.data || [],
        total: totalCount,
      };
    } catch (error) {
      console.error(`Error in getList for ${resource}:`, error);
      throw error;
    }
  },

  getOne: async (resource, params) => {
    try {
      const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`);
      return { data: json };
    } catch (error) {
      console.error(`Error in getOne for ${resource}/${params.id}:`, error);
      throw error;
    }
  },

  create: async (resource, params) => {
    let newParams = { ...params };
    
    try {
      // Handle image upload if present
      if (params.data.imageSrc && params.data.imageSrc.rawFile) {
        const imageUrl = await handleImageUpload(params.data.imageSrc.rawFile);
        newParams.data = {
          ...params.data,
          imageSrc: imageUrl,
        };
      }

      const { json } = await httpClient(`${apiUrl}/${resource}`, {
        method: 'POST',
        body: JSON.stringify(newParams.data),
      });
      
      return { data: json };
    } catch (error) {
      console.error(`Error in create for ${resource}:`, error);
      throw error;
    }
  },

  update: async (resource, params) => {
    let newParams = { ...params };
    
    try {
      console.log(`[dataProvider.update] Starting update for ${resource}/${params.id}`, params.data);
      
      // Remove the __typename field if present (can cause issues with GraphQL APIs)
      if (newParams.data.__typename) {
        delete newParams.data.__typename;
      }
      
      // Handle image upload if present
      if (params.data.imageSrc && params.data.imageSrc.rawFile) {
        console.log(`[dataProvider.update] Uploading image for ${resource}/${params.id}`);
        const imageUrl = await handleImageUpload(params.data.imageSrc.rawFile);
        console.log(`[dataProvider.update] Image uploaded successfully: ${imageUrl}`);
        newParams.data = {
          ...params.data,
          imageSrc: imageUrl,
        };
      } else if (params.data.imageSrc && params.data.imageSrc.src) {
        // Handle case where imageSrc is an object with src property
        console.log(`[dataProvider.update] Using existing image src: ${params.data.imageSrc.src}`);
        newParams.data = {
          ...params.data,
          imageSrc: params.data.imageSrc.src,
        };
      }

      console.log(`[dataProvider.update] Sending request to ${apiUrl}/${resource}/${params.id}`, newParams.data);

      const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(newParams.data),
      });
      
      console.log(`[dataProvider.update] Update successful for ${resource}/${params.id}`, json);
      
      return { data: json };
    } catch (error) {
      console.error(`[dataProvider.update] Error in update for ${resource}/${params.id}:`, error);
      throw error;
    }
  },

  delete: async (resource, params) => {
    try {
      const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
        method: 'DELETE',
      });
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
      const query = {
        filter: JSON.stringify({ id: params.ids }),
      };
      const url = `${apiUrl}/${resource}?${stringify(query)}`;
      const { json } = await httpClient(url);
      return { data: json || [] };
    } catch (error) {
      console.error(`Error in getMany for ${resource}:`, error);
      throw error;
    }
  },

  getManyReference: async (resource, params) => {
    try {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const query = {
        sort: JSON.stringify([field, order]),
        range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
        filter: JSON.stringify({
          ...params.filter,
          [params.target]: params.id,
        }),
      };
      const url = `${apiUrl}/${resource}?${stringify(query)}`;
      const { json, headers } = await httpClient(url);
      
      // Get total count from headers
      const totalCount = headers.get('x-total-count')
        ? parseInt(headers.get('x-total-count') as string, 10)
        : Array.isArray(json) 
          ? json.length 
          : (json.total || 0);
          
      return {
        data: Array.isArray(json) ? json : (json.data || []),
        total: totalCount,
      };
    } catch (error) {
      console.error(`Error in getManyReference for ${resource}:`, error);
      throw error;
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