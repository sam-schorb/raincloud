import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setPatchNumber } from '../slices/patchInfoSlice';
import { likePatch, unlikePatch, selectIsLoading } from '../slices/likedPatchesSlice';
import { selectUser } from '../slices/userSlice';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

const ImagePlaceholder = () => (
  <div className="animate-pulse bg-gray-300 w-full h-48"></div>
);

const ListTable = (({ singlePatchInfo, likeCount, isLiked }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userId = user ? user.id : null;
  const isLoading = useSelector(selectIsLoading);
  const [localHasLiked, setLocalHasLiked] = useState(isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const fetchImageData = async (patchId) => {
      try {
        const response = await fetch(`/patchImage/${patchId}`);
        if (!response.ok) throw new Error(response.statusText);
        const imageData = await response.json();
        setImageSrc(`data:image/png;base64,${imageData}`);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    if (singlePatchInfo._id && !imageSrc) {
      fetchImageData(singlePatchInfo._id);
    }
  }, [singlePatchInfo._id, imageSrc]);

  useEffect(() => {
    setLocalHasLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLocalLikeCount(likeCount);
  }, [likeCount]);

  const handleSetPatchNumber = () => {
    dispatch(setPatchNumber(singlePatchInfo._id));
    navigate('/');
  };

  const navigateToDevicePage = () => {
    navigate({
      pathname: `/device/${singlePatchInfo._id}`,
      state: { patchInfo: singlePatchInfo }
    });
  };

  const truncatedDescription = singlePatchInfo.description
    ? singlePatchInfo.description.length > 160
      ? `${singlePatchInfo.description.substring(0, 157)}...`
      : singlePatchInfo.description
    : '';

  const handleLikeToggle = (e) => {
    e.stopPropagation();
    if (!userId) {
      console.log("Please login first");
      return;
    }

    const handleLike = () => {
      if (localHasLiked) return;
      dispatch(likePatch({ userId, patchId: singlePatchInfo._id }))
        .then(() => {
          setLocalHasLiked(true);
          setLocalLikeCount(prevCount => prevCount + 1);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    };

    const handleUnlike = () => {
      if (!localHasLiked) return;
      dispatch(unlikePatch({ userId, patchId: singlePatchInfo._id }))
        .then(() => {
          setLocalHasLiked(false);
          setLocalLikeCount(prevCount => prevCount - 1);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    };

    localHasLiked ? handleUnlike() : handleLike();
  };

  const onImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
<table className="border-2 border-true-gray w-full my-4 table-fixed">
  <tbody>
    <tr className="bg-light-gray">
      <td className="border-2 border-true-gray p-3 w-1/3 text-base lg:text-lg break-normal truncate whitespace-normal">
        <Link to={`/device/${singlePatchInfo._id}`} className="hover:underline hover:text-white">
          {singlePatchInfo.name}
        </Link>
        &nbsp;by&nbsp;
        <Link to={`/artist/${singlePatchInfo.username}`} className="hover:underline hover:text-white">
          {singlePatchInfo.username}
        </Link>
      </td>

      <td className="border-t-2 border-b-2 w-1/3 p-1 border-true-gray">
        {!isImageLoaded && !imageSrc && <ImagePlaceholder />}
        {imageSrc && (
            <img
            src={imageSrc}
            alt="Patch"
            className={`w-auto h-auto ${isImageLoaded ? 'block' : 'hidden'}`}
            onLoad={onImageLoad}
            />
        )}
      </td>
      <td className="border-t-2 border-b-2 border-r-2 w-1/3 border-true-gray p-3">
        {truncatedDescription}
        <button onClick={navigateToDevicePage} className="underline text-blue-500"> (More info)</button>
      </td>
    </tr>
    <tr style={{ backgroundColor: '#9e9e9e' }}>
      <td className="border-t-2 border-b-2 border-l-2 border-true-gray p-3 w-1/3 text-base lg:text-lg">
        <button
          onClick={handleSetPatchNumber}
          className="py-2 px-4 border-2 border-medium-gray bg-light-gray hover:bg-true-gray hover:text-white rounded"
        >
          Load patch
        </button>
      </td>
      <td className="border-2 border-true-gray p-3 w-1/3 text-base lg:text-lg">
        <button
          onClick={handleLikeToggle}
          disabled={isLoading}
          className="flex items-center px-2 py-1 bg-transparent border-0 rounded"
        >
          {localHasLiked ? <AiFillHeart color="white" size="2em" /> : <AiOutlineHeart color="white" size="2em" />}
        </button>
        Likes: {localLikeCount}
      </td>
      <td className="border-t-2 border-b-2 border-r-2 border-true-gray p-3 w-1/3 text-base lg:text-lg">
        {Array.isArray(singlePatchInfo.tags) ? singlePatchInfo.tags.join(', ') : singlePatchInfo.tags}
      </td>
    </tr>
  </tbody>
</table>
  )});

ListTable.propTypes = {
  singlePatchInfo: PropTypes.object.isRequired,
  likeCount: PropTypes.number.isRequired,
  isLiked: PropTypes.bool.isRequired
};

export default memo(ListTable);
