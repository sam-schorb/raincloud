import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../slices/userSlice';

const RequirePatchOwner = ({ children }) => {
    const { patchId } = useParams();
    const user = useSelector(selectUser);
    const [isOwner, setIsOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const checkOwnership = async () => {
        try {
          const response = await axios.get(`/getPatchCreator/${patchId}`);
          if (response.status === 200 && user) {
            const fetchedCreatorId = String(response.data.creator).trim();
            const currentUserId = String(user.id).trim(); // Access the userId property

            // Check if the IDs match
            const isUserOwner = fetchedCreatorId === currentUserId;
            console.log(`Is logged-in user the creator? ${isUserOwner}`);

            setIsOwner(isUserOwner);
          } else {
            console.log('HTTP response status not OK or no user object.');
          }
        } catch (error) {
          console.error('Error checking patch ownership:', error);
        }
        setIsLoading(false);
      };
      
      if (user && user.id) {
        checkOwnership();
      } else {
        console.log('No user logged in or user ID is missing.');
        setIsLoading(false);
      }
    }, [user, patchId]);
  
    if (isLoading) {
      return <p>Checking permissions...</p>;
    }
  
    if (!user) {
      console.log('No user present, redirecting to home.');
      return <Navigate to="/" replace />;
    }

    if (!isOwner) {
      console.log('User is not the owner, redirecting to home.');
      return <Navigate to="/" replace />;
    }
  
    return children;
};


export default React.memo(RequirePatchOwner);
