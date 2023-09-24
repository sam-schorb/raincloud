import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaHeart, FaSignInAlt, FaUpload } from 'react-icons/fa'; // Import icons
import axios from 'axios';
import Setup from './Setup';
import MetadataModal from './MetadataModal';
import AuthModal from './AuthModal';
import EmailVerification from './EmailVerification';
import ResetPasswordForm from './ResetPasswordForm';
import { useSelector, useDispatch } from 'react-redux';
import { setPatchInfoData, setPatchNumber, selectPatchInfoData, selectPatchNumber } from '../slices/patchInfoSlice';
import { setUser as setUserAction, selectUser, clearUser } from '../slices/userSlice';
import FavouritesPage from './FavouritesPage';
import SearchPage from './SearchPage';
import PlayBar from './PlayBar'; // Import PlayBar component
import Notification from './Notification';
import logo from '../images/iimaginaryLogoDarkGray.jpeg'
import ManagePatches from './ManagePatches';
import UserDropdown from './UserDropdown';
import HelpPage from './HelpPage';



function App() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const location = useLocation();

  const patchInfo = useSelector(selectPatchInfoData);
  const patchNumber = useSelector(selectPatchNumber);

  const [searchTerm, setSearchTerm] = useState('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [notificationType, setNotificationType] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState(null);

  const fetchPatchInfo = useCallback(async () => {
    try {
      const res = await axios.get('/getPatchInfo');
      dispatch(setPatchInfoData(res.data));
    } catch (error) {
      console.error('Error loading patch summaries:', error);
    }
  }, [dispatch]);

  const getNotificationMessage = (type) => {
    const messages = {
      'upload': 'Sign in to upload patches',
      'Email verified successfully!': 'Email verified successfully!', // Add this line
      'Failed to verify email.': 'Failed to verify email.', // Add this line
      'Error occurred while verifying email.': 'Error occurred while verifying email.', // Add this line
      'patchDeleted': 'Patch deleted', // Add this line
      'Added to Favourites': 'Added to Favourites',
      'Removed from Favourites': 'Removed from Favourites',
      // ... (other codes)
    };

    return messages[type];
  };

  const handleLogout = async () => {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        let message = '';

        if (response.ok) {
            const data = await response.json();
            dispatch(clearUser());
            message = data || 'Logged out successfully';

            // If on managePatches page, navigate to searchPage
            if (location.pathname === '/managePatches') {
              navigate('/');
          }
        } else if (response.headers.get('Content-Type').includes('application/json')) {
            const data = await response.json();
            message = data.message;
        } else {
            message = await response.text();
        }

        setNotificationType(message);

        // Clear the feedback message after 5 seconds
        setTimeout(() => {
            setNotificationType('');
        }, 5000);

    } catch (error) {
        console.error("Error:", error);
        setNotificationType('Error during logout.');

        // Clear the feedback message after 5 seconds
        setTimeout(() => {
            setNotificationType('');
        }, 5000);
    }
};



  useEffect(() => {
    if (notificationType) {
      const message = getNotificationMessage(notificationType);
      setNotificationMessage(message || notificationType);
    }
  }, [notificationType]);

  useEffect(() => {

    fetchPatchInfo();

    const checkAuthentication = async () => {
      try {
        const response = await axios.get('/validateToken', { withCredentials: true });
        if (response.data.isAuthenticated) {
          dispatch(setUserAction(response.data.user));  // Use the 'user' field
          console.log('User logged in automatically due to the presence of a valid token.');
        } else {
          console.log('No logged in user.');
          dispatch(setUserAction(null));
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('No token or token is invalid.');
          dispatch(setUserAction(null));
        } else {
          console.error('Error while checking for a valid token:', error);
          dispatch(setUserAction(null));
        }
      }
    };
    
    

    checkAuthentication();
  }, [dispatch, fetchPatchInfo]);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openUpload = () => {
    if (!user) {
      setNotificationType('upload');
    } else {
      setIsMetadataModalOpen(true);
    }
  };
  return (
    <div id="rnbo-root" className="text-white min-h-screen flex flex-col items-center justify-start">
    {notificationMessage && <Notification message={notificationMessage} setType={setNotificationType} />}
    
    <div className="w-full bg-vdark-gray p-4 flex justify-center items-center h-16 mb-5">
        {/* Logo Section */}
        <div className="absolute left-7 top-3 flex items-center">
            <img src={logo} alt="Droplets Logo" style={{ height: '40px' }} className="hidden md:inline-block" />
            <span className="hidden md:inline-block text-white text-l ml-4">Droplets</span>
        </div>
        
        <div className="w-full md:w-2/3 grid grid-cols-4 text-center text-l">
          <Link to="/" className="text-gray-400 hover:text-white p-2 flex justify-center items-center transition-colors duration-300">
            <FaSearch className="text-icon-lg sm:text-icon-lg md:text-base lg:text-base mr-3 md:mr-5" /><span className="hidden md:inline-block">Search</span>
          </Link>
          <Link to="/favourites" className="text-gray-400 hover:text-white p-2 flex justify-center items-center transition-colors duration-300">
            <FaHeart className="text-icon-lg sm:text-icon-lg md:text-base lg:text-base mr-3 md:mr-5" /><span className="hidden md:inline-block">Favourites</span>
          </Link>
          <div className="text-gray-400 hover:text-white p-2 flex justify-center items-center transition-colors duration-300" onClick={openUpload}>
            <FaUpload className="text-icon-lg sm:text-icon-lg md:text-base lg:text-base mr-3 md:mr-5" /><span className="hidden md:inline-block">Upload</span>
          </div>
          {user ? (
              <div className="text-gray-400 hover:text-white p-2 flex justify-left items-center transition-colors duration-300">
                  <UserDropdown handleLogout={handleLogout} navigate={navigate} />
              </div>
          ) : (
              <div className="text-gray-400 hover:text-white p-2 flex justify-center items-center transition-colors duration-300" onClick={openAuthModal}>
                  <FaSignInAlt className="text-icon-lg sm:text-icon-lg md:text-base lg:text-base mr-3 md:mr-5" /><span className="hidden md:inline-block">Sign In</span>
              </div>
          )}
        </div>
        </div>

        {isAuthModalOpen && <AuthModal closeModal={closeAuthModal} setNotificationType={setNotificationType} />}
        <MetadataModal isOpen={isMetadataModalOpen} closeModal={() => setIsMetadataModalOpen(false)} fetchPatchInfo={fetchPatchInfo} />
        <Setup patchNumber={patchNumber} />
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/verify-email/:token" element={<EmailVerification setNotificationType={setNotificationType} />} />
          <Route path="/" element={
            <SearchPage
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              patchInfo={patchInfo}
              setPatchNumber={setPatchNumber}
            />
          } />
          <Route path="/favourites" element={
            <FavouritesPage
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          } />
          <Route path="/managePatches" element={<ManagePatches />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
        <PlayBar setNotificationType={setNotificationType} />
      </div>
  );
}

export default App;