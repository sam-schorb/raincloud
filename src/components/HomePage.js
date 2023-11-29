
import { useSelector } from 'react-redux';
import { selectPatchNumber } from '../slices/patchInfoSlice';

import React, { useState, useEffect } from 'react';
import LayoutInterface from './LayoutInterface';
import PatchTitle from './PatchTitle';

function HomePage({ onLayoutLoaded }) {  // <-- Destructure the prop here
  const patchNumber = useSelector(selectPatchNumber);

  // Key for forcing re-render
  const [key, setKey] = useState(Math.random());

  useEffect(() => {
    setKey(Math.random());
  }, [patchNumber]);

  return (
    <div className="w-full">   
      <PatchTitle/>     

      <div style={{ fontSize: '48px', textAlign: 'center', marginTop: '20px' }}>
      <LayoutInterface key={key} onLoaded={onLayoutLoaded} />
      </div>
    </div>
  );
}

export default React.memo(HomePage);

