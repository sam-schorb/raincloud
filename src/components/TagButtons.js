import React, { useState } from 'react';

const buttonTags = [
  "All", "Synth", "Sequencer", "Drum Machine", "Sampler", 
  "Effect", "Glitch", "Utility", "Modulation"
];

function TagButtons({ setSelectedTag }) {
  const [activeTag, setActiveTag] = useState('All');

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    // Sending lowercase tag to the parent component
    setSelectedTag(tag.toLowerCase());
  };

  return (
    <div className="flex justify-between w-full mb-2">
      {buttonTags.map(tag => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`py-2 px-4 border-2 border-medium-gray
          ${activeTag === tag ? 'bg-true-gray text-white' : 'bg-light-gray hover:bg-true-gray hover:text-white'} 
          rounded mx-2`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export default TagButtons;
