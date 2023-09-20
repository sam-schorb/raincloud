import { useState, useEffect } from 'react';
import axios from 'axios';

const usePaginatedPatches = () => {
  const [patches, setPatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const limit = 20;  // Number of patches to fetch at a time

  const fetchPatches = async (skip = 0) => {
    try {
      setLoading(true);
      const response = await axios.get('/getPatchInfo', {
        params: {
          skip: skip,
          limit: limit,
        },
      });
      const newPatches = response.data;

      // Append new patches to the existing patches
      setPatches((prevPatches) => [...prevPatches, ...newPatches]);

      // If the number of patches returned is less than the limit, it means we've fetched all the patches
      if (newPatches.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (loading || !hasMore) return;
    fetchPatches(patches.length); // Skip already fetched patches
  };

  useEffect(() => {
    fetchPatches();  // Initial fetch
  }, []);

  return {
    patches,
    loading,
    error,
    hasMore,
    loadMore,
  };
};

export default usePaginatedPatches;
