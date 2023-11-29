import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../slices/userSlice';
import ListTable from './ListTable';

const ListOfTables = ({ searchTerm, sortMethod, searchTag, currentPage, setCurrentPage }) => {
  const user = useSelector(selectUser);
    const userId = user ? user.id : null;

    const [patchInfo, setPatchInfo] = useState([]);  // patchInfo will now be fetched from the server
    const [userLikedPatches, setUserLikedPatches] = useState([]);
    const [likeCountsMap, setLikeCountsMap] = useState({});
    const [totalPages] = useState(2); // Assuming for now. Can be changed based on server response


    // Utility functions
    // This function should take an array of patchIds as an argument
    const fetchLikeCounts = async (patchIds) => {
        // Make sure to send a POST request with the patchIds in the body
        const response = await fetch('/likeCounts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patchIds }), // Send patchIds in the body
        });
    
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        console.log('Like counts:', data); // Log the like counts here
        return data;
    };
  

    const fetchUserLikes = async (userId) => {
        if (!userId) return Promise.resolve();
        const response = await fetch(`/userLikes/${userId}`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        console.log('likes: ', data.likes)
        return data.likes;
    };

    const fetchPaginatedPatches = async (page = 1) => {
        const response = await fetch(`/getPaginatedPatchInfo?page=${page}&searchTerm=${searchTerm}&tags=${searchTag}&sortMethod=${sortMethod}`);
        console.log('response: ', response);
        if (!response.ok) throw new Error(response.statusText);
        return await response.json();
    };

    useEffect(() => {
        if (!userId) {
            setUserLikedPatches([]);
        }
    }, [userId]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const patches = await fetchPaginatedPatches(currentPage);
            setPatchInfo(patches);
      
            // Now that we have our patches, we can get their IDs and fetch like counts
            const patchIds = patches.map(patch => patch._id);
            const counts = await fetchLikeCounts(patchIds); // Pass the patchIds to fetch like counts
            setLikeCountsMap(counts);
            
            console.log('Patches:', patches);
          } catch (error) {
            console.error("Error fetching paginated patches:", error);
          }
        };
      
        fetchData();
      
        if (userId) {
          fetchUserLikes(userId)
            .then((likes) => {
              setUserLikedPatches(likes);
            })
            .catch(err => console.error("Error fetching user likes:", err.message));
        }
      }, [currentPage, searchTerm, searchTag, sortMethod, userId]);
      

    return (
        <div className="w-full mx-auto text-left">
            <ul className="list-none">
                {patchInfo.map(patch => (
                    <li key={patch._id}>
                      <ListTable 
                          singlePatchInfo={patch} 
                          likeCount={likeCountsMap[patch._id] || 0} 
                          isLiked={userLikedPatches.includes(patch._id)}
                      />
                    </li>
                ))}
            </ul>
            <div className="pagination-controls">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
            </div>
        </div>
    );
};

export default React.memo(ListOfTables);
