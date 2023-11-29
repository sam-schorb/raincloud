import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectPatchNumber } from '../slices/patchInfoSlice';


const getTableInfo = async (patchNumber) => {
  try {
    const response = await axios.get(`/getTableInfo/${patchNumber}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch patch info:', error);
    return null;
  }
};

function InfoTable() {
  const [tableData, setTableData] = useState(null);
  const patchNumber = useSelector(selectPatchNumber);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchTableData = async () => {
      setIsLoading(true);
      if (!patchNumber) {
        console.error('Patch number not provided.');
        setError("Patch number not provided");
        setIsLoading(false);
        return;
      }
      const data = await getTableInfo(patchNumber);
      setTableData(data);
      setIsLoading(false);
    };

    fetchTableData();
  }, [patchNumber]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>; // Placeholder text, you can replace this with a spinner or any other loading indicator.
  }

  if (!tableData) {
    return null; // Render nothing if there's no data
  }

  // Convert the uploadDate into the desired format
  const formatDate = (dateStr) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateStr);
    let formattedDate = date.toLocaleDateString(undefined, options);
    const day = date.getUTCDate();
    if (day === 1 || day === 21 || day === 31) formattedDate = formattedDate.replace(day, day + "st");
    else if (day === 2 || day === 22) formattedDate = formattedDate.replace(day, day + "nd");
    else if (day === 3 || day === 23) formattedDate = formattedDate.replace(day, day + "rd");
    return `${formattedDate}`;
  };

  const truncatedDescription = tableData && tableData.description 
  ? (tableData.description.length > 160 
      ? `${tableData.description.substring(0, 157)}...` 
      : tableData.description)
  : '';

  return (
    <table className="border-t border-b border-true-gray w-full my-4 -mt-5" /* Adjusted margin-top */>
      <tbody>
        <tr>
          <td className="border-t border-b border-l border-true-gray" /* Adjusted padding-right and border */>
            {tableData.image && <img src={`data:image/png;base64,${tableData.image}`} alt="Patch" className="w-16 h-16 object-cover" />}
          </td>
          <td className="border border-true-gray text-medium-gray px-2">{tableData.name}</td>
          <td className="border border-true-gray text-medium-gray px-2">{tableData.username}</td>
          <td className="border border-true-gray text-medium-gray px-2">{truncatedDescription}</td> 
          <td className="border border-true-gray text-medium-gray px-2">{formatDate(tableData.uploadDate)}</td>
          <td className="border border-true-gray text-medium-gray px-2">
            {Array.isArray(tableData.tags) ? tableData.tags.join(', ') : tableData.tags} 
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default InfoTable;
