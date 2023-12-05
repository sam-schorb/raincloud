// ArtistPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ListEntry from './ListEntry';

const ArtistPage = () => {
    const { username } = useParams();
    const [artistPatches, setArtistPatches] = useState([]);
    const [artistInfo, setArtistInfo] = useState({});

    useEffect(() => {
        const fetchArtistInfoAndPatches = async () => {
            try {
                const artistInfoResponse = await axios.get(`/getUserByUsername/${username}`);
                setArtistInfo(artistInfoResponse.data);

                const patchesResponse = await axios.get(`/getArtistPatchInfo/${username}`);
                setArtistPatches(patchesResponse.data);
            } catch (error) {
                console.error('Error fetching artist data:', error);
            }
        };

        fetchArtistInfoAndPatches();
    }, [username]);

    return (
        <div className="w-full px-4">
            {/* Artist picture and name */}
            <div className="flex flex-col items-center">
                {artistInfo.profilePicture && (
                    <img 
                        src={`data:image/jpeg;base64,${artistInfo.profilePicture}`}
                        alt={`${artistInfo.username}'s profile`}
                        className="w-64 h-64  rounded-full object-cover"
                    />
                )}
                <h1 className="text-4xl font-semibold mt-2">{artistInfo.username}</h1>
            </div>
            < br/>
            {/* List of patches by the artist */}
            <div className="mt-4 w-11/12 lg:w-2/3 mx-auto">
                {artistPatches.length > 0 ? (
                    artistPatches.map(patch => (
                        <ListEntry
                            key={patch._id}
                            singlePatchInfo={patch}
                            username={username}
                            isArtistPage={true}
                        />
                    ))
                ) : (
                    <p className="text-center">No patches found for this artist.</p>
                )}
            </div>
        </div>
    );
};

export default ArtistPage;
