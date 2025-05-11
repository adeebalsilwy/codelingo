/**
 * Helper functions for API routes to ensure consistent behavior
 */

import { NextResponse } from "next/server";

/**
 * Creates a consistent API response with proper headers
 * @param data Data to return in the response
 * @param options Additional options for the response
 * @returns NextResponse with consistent headers
 */
export function createApiResponse(data: any, options: {
  status?: number;
  contentRange?: string;
  totalCount?: number;
  noCaching?: boolean;
} = {}) {
  const {
    status = 200,
    contentRange,
    totalCount,
    noCaching = true
  } = options;

  const headers: Record<string, string> = {
    "Access-Control-Expose-Headers": "Content-Range, X-Total-Count",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Total-Count, Content-Range",
  };

  if (contentRange) {
    headers["Content-Range"] = contentRange;
  }

  if (totalCount !== undefined) {
    headers["X-Total-Count"] = totalCount.toString();
  }

  if (noCaching) {
    headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = "0";
    headers["Date"] = new Date().toUTCString();
    headers["Last-Modified"] = new Date().toUTCString();
  }

  return NextResponse.json(data, {
    status,
    headers
  });
}

/**
 * Determines if we should fetch all records based on request parameters
 * @param searchParams URL search parameters
 * @returns boolean indicating if all records should be fetched
 */
export function shouldFetchAll(searchParams: URLSearchParams): boolean {
  const fetchAllParam = searchParams.get("fetchAll");
  // Default to fetching all data if no specific parameters are provided or fetchAll=true
  const hasAnyParams = searchParams.toString().length > 0;
  return fetchAllParam === 'true' || !hasAnyParams;
}

/**
 * Parses common API parameters from URL search params
 * @param searchParams URL search parameters
 * @returns Object with parsed parameters
 */
export function parseApiParams(searchParams: URLSearchParams) {
  // Support fetchAll parameter
  const fetchAll = shouldFetchAll(searchParams);
  
  // Parse range parameter
  const rangeParam = searchParams.get("range");
  let start = 0, end = 10;
  
  if (rangeParam) {
    try {
      const range = JSON.parse(rangeParam);
      start = range[0] || 0;
      end = range[1] || 10;
    } catch (e) {
      console.error('Invalid range parameter:', rangeParam, e);
      // Fall back to legacy parameters
      start = parseInt(searchParams.get("_start") || "0");
      end = parseInt(searchParams.get("_end") || "10");
    }
  } else {
    // Fallback to legacy parameters
    start = parseInt(searchParams.get("_start") || "0");
    end = parseInt(searchParams.get("_end") || "10");
  }
  
  // Parse sort parameter
  const sortParam = searchParams.get("sort");
  let sort = "id";
  let order = "ASC";
  
  if (sortParam) {
    try {
      const sortValues = JSON.parse(sortParam);
      if (Array.isArray(sortValues) && sortValues.length === 2) {
        sort = sortValues[0] || "id";
        order = sortValues[1] || "ASC";
      }
    } catch (e) {
      console.error('Invalid sort parameter:', sortParam, e);
      // Fallback to legacy parameters
      order = searchParams.get("_order") || "ASC";
    }
  } else {
    // Fallback to legacy parameters
    order = searchParams.get("_order") || "ASC";
  }
  
  // Parse filter parameter
  const filterParam = searchParams.get("filter");
  let filter: Record<string, any> = {};
  
  if (filterParam) {
    try {
      filter = JSON.parse(filterParam);
    } catch (e) {
      console.error('Invalid filter parameter:', filterParam, e);
    }
  }

  return {
    fetchAll,
    start,
    end,
    sort,
    order,
    filter
  };
} 