import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { selectPatchInfoData, setPatchNumber } from '../slices/patchInfoSlice';
import Comments from './Comments';

const DevicePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patchId } = useParams();
  const allPatchInfo = useSelector(selectPatchInfoData);
  const patchInfo = allPatchInfo.find(patch => patch._id === patchId) || {};

  const handleSetPatchNumber = () => {
    dispatch(setPatchNumber(patchInfo._id));
    navigate('/');
  };

  return (
    <div style={{ all: 'unset', fontSize: 'initial', width: '66%', boxSizing: 'border-box' }}>
      {/* Device Page Title */}
      <div className="text-2xl mb-2 text-center p-4">Device details</div>

      {/* Flex container for device details */}
      <div style={{ display: 'flex', width: '100%' }}>
        {/* Device Information Table */}
        <div style={{ flex: '2' }}>
          <table className="border-2 border-true-gray justify-left my-4" style={{ width: '100%', boxSizing: 'border-box' }}>
            <tbody>
              {/* Device Name Row */}
              <tr style={{ backgroundColor: '#9e9e9e' }}>
                <td className="border-2 border-true-gray p-3 w-1/6 text-lg">Name</td>
                <td className="border-2 border-true-gray p-3 w-5/6">{patchInfo.name}</td>
              </tr>
              {/* Username Row */}
              <tr className="bg-light-gray">
                <td className="border-2 border-true-gray p-3 w-1/6 text-lg">Username</td>
                <td className="border-2 border-true-gray p-3 w-5/6">{patchInfo.username}</td>
              </tr>
              {/* Description Row */}
              <tr style={{ backgroundColor: '#9e9e9e' }}>
                <td className="border-2 border-true-gray p-3 w-1/6 text-lg">Description</td>
                <td className="border-2 border-true-gray p-3 w-5/6">{patchInfo.description}</td>
              </tr>
              {/* Upload Date Row */}
              <tr className="bg-light-gray">
                <td className="border-2 border-true-gray p-3 w-1/6 text-lg">Upload Date</td>
                <td className="border-2 border-true-gray p-3 w-5/6">{patchInfo.uploadDate}</td>
              </tr>
              {/* Tags Row */}
              <tr style={{ backgroundColor: '#9e9e9e' }}>
                <td className="border-2 border-true-gray p-3 w-1/6 text-lg">Tags</td>
                <td className="border-2 border-true-gray p-3 w-5/6">
                  {Array.isArray(patchInfo.tags) ? patchInfo.tags.join(', ') : patchInfo.tags}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Device Image Section */}
        {patchInfo.image && (
          <div className='my-4' style={{ flex: '1', marginLeft: '2%', boxSizing: 'border-box' }}>
            <img 
              src={`data:image/png;base64,${patchInfo.image}`} 
              alt="Patch"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>

      {/* Load Patch Button */}
      <div>
        <button
          onClick={handleSetPatchNumber}
          className="py-2 px-4 border-2 border-medium-gray bg-light-gray hover:bg-true-gray hover:text-white rounded"
        >
          Load patch
        </button>
      </div>

      {/* Comments Section */}
      <Comments patchId={patchId}/>
    </div>
  );
}

export default DevicePage;