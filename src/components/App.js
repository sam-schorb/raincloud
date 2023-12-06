import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FaSearch, FaSignInAlt, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import Setup from './Setup';
import MetadataModal from './MetadataModal';
import AuthModal from './AuthModal';
import EmailVerification from './EmailVerification';
import ResetPasswordForm from './ResetPasswordForm';
import { useSelector, useDispatch } from 'react-redux';
import { setPatchInfoData, setPatchNumber, selectPatchInfoData } from '../slices/patchInfoSlice';
import { setUser as setUserAction, selectUser, clearUser } from '../slices/userSlice';
import { setIsUserInteracted } from '../slices/layoutSlice';
import HomeRandomButton from './HomeRandomButton';
import Notification from './Notification';
import logo from '../images/iimaginaryLogoLightGray.jpg';
import UserDropdown from './UserDropdown';
import ParametersModal from './ParametersModal';
import ErrorBoundary from './ErrorBoundary';
import RequirePatchOwner from './RequirePatchOwner';
// Lazy loaded components
const FavouritesPage = React.lazy(() => import('./FavouritesPage'));
const ExplorePage = React.lazy(() => import('./ExplorePage'));
const ManageUploads = React.lazy(() => import('./ManageUploads'));
const HelpPage = React.lazy(() => import('./HelpPage'));
const HomePage = React.lazy(() => import('./HomePage'));
const EditLayout = React.lazy(() => import('./EditLayout'));
const DevicePage = React.lazy(() => import('./DevicePage'));
const ArtistPage = React.lazy(() => import('./ArtistPage'));


export const TempDataContext = React.createContext();

function App() {
  // State and Redux hooks
  const user = useSelector(selectUser);
  const patchInfo = useSelector(selectPatchInfoData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLayoutLoaded = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [isParametersModalOpen, setIsParametersModalOpen] = useState(false);
  const [notificationType, setNotificationType] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [tempData, setTempData] = useState({});

  // Fetch patch information from server
  const fetchPatchInfo = useCallback(async () => {
    try {
      const res = await axios.get('/getPatchInfo');
      dispatch(setPatchInfoData(res.data));
    } catch (error) {
      console.error('Error loading patch summaries:', error);
    }
  }, [dispatch]);

  // Notification message mapping
  const getNotificationMessage = (type) => {
    const messages = {
      'upload': 'Sign in to upload patches',
      'Email verified successfully!': 'Email verified successfully!', // Add this line
      'Failed to verify email.': 'Failed to verify email.', // Add this line
      'Error occurred while verifying email.': 'Error occurred while verifying email.', // Add this line
      'Patch Deleted': 'Patch Deleted',
      'Error deleting patch': 'Error deleting patch',
      'Added to Favourites': 'Added to Favourites',
      'Removed from Favourites': 'Removed from Favourites',
      'Image file too large': 'Image file too large',
      'Patch file too large': 'Patch file too large',
      'Patch uploaded successfully': 'Patch uploaded successfully',
      'Failed to upload patch': 'Failed to upload patch',
      'Save layout successful': 'Save layout successful',
      'Save layout failed': 'Save layout failed',
    }
    return messages[type];
  };
  
  // Handle user logout process
  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        dispatch(clearUser());
        setNotificationType('Logged out successfully');
        if (location.pathname === '/managePatches') {
          navigate('/');
        }
      } else {
        const message = response.headers.get('Content-Type').includes('application/json') ?
          (await response.json()).message : await response.text();
        setNotificationType(message);
      }

      setTimeout(() => setNotificationType(''), 5000);
    } catch (error) {
      console.error("Error during logout:", error);
      setNotificationType('Error during logout.');
      setTimeout(() => setNotificationType(''), 5000);
    }
  };

  // Require authentication for certain routes
  const RequireAuth = ({ children }) => {
    if (!user) return <Navigate to="/" replace />;
    return children;
  };

  // Update notification message on type change
  useEffect(() => {
    setNotificationMessage(getNotificationMessage(notificationType));
  }, [notificationType]);

  // Check authentication and fetch patch info on mount
  useEffect(() => {
    fetchPatchInfo();

    const checkAuthentication = async () => {
      try {
        const response = await axios.get('/validateToken', { withCredentials: true });
        dispatch(setUserAction(response.data.isAuthenticated ? response.data.user : null));
      } catch (error) {
        console.error('Error while checking for a valid token:', error);
        dispatch(setUserAction(null));
      }
    };

    checkAuthentication();
  }, [dispatch, fetchPatchInfo]);

  // Modal control handlers
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const closeMetadataModal = () => setIsMetadataModalOpen(false);
  const closeParametersModal = () => setIsParametersModalOpen(false);


  const AuthModalClickNext = () => {
    console.log('AuthModalClickNext called');
    console.log('isParametersModalOpen before:', isParametersModalOpen);
    closeMetadataModal();  // Call the renamed closeMetadataModal function
    setIsParametersModalOpen(true);  // Open parameters modal
    console.log('isParametersModalOpen after:', isParametersModalOpen);
};

  const openUpload = () => {
    if (!user) {
      setNotificationType('upload');
    } else {
      setIsMetadataModalOpen(true);
    }
  };

  useEffect(() => {
    const pathsToReset = [
      '/explore',
      '/favourites',
      '/manageUploads',
      '/help',
      '/devicePage'
    ];
  
    // Only reset the patchNumber if the current pathname does not start with /patch/
    if (pathsToReset.some(path => location.pathname.startsWith(path))) {
      dispatch(setPatchNumber(null));
    }
  }, [location.pathname, dispatch]);

// In your App component
const { pathname } = useLocation();

// Updated regex to match both '/patch/' and '/editLayout/' paths
const match = pathname.match(/^\/(patch|editLayout)\/(.+)/);
const patchIdFromURL = match ? match[2] : null; // match[2] will contain the patch ID

useEffect(() => {
  // Only dispatch setPatchNumber if the app is initialized and the URL contains a patch ID
  if (patchIdFromURL) {
    dispatch(setPatchNumber(patchIdFromURL));
  }
}, [dispatch, patchIdFromURL]);


 // Use effect to set up user interaction detection
 useEffect(() => {
  // Event handler to capture user interaction
  const handleUserInteraction = () => {
    dispatch(setIsUserInteracted(true)); // Dispatch action to Redux store
    // Remove event listeners after interaction
    document.removeEventListener('click', handleUserInteraction);
    document.removeEventListener('keydown', handleUserInteraction);
  };

  // Add event listeners for the first user interaction
  document.addEventListener('click', handleUserInteraction);
  document.addEventListener('keydown', handleUserInteraction);

  // Cleanup the event listeners on component unmount
  return () => {
    document.removeEventListener('click', handleUserInteraction);
    document.removeEventListener('keydown', handleUserInteraction);
  };
}, [dispatch]); // Empty dependency array means this effect will only run once on mount

return (
  <ErrorBoundary>
  <div id="rnbo-root" className="text-medium-gray min-h-screen flex flex-col items-center justify-start">
      {notificationMessage && <Notification message={notificationMessage} setType={setNotificationType} />}

      <div className="w-full bg-gradient-medium-to-true-gray p-4 flex justify-center items-center h-16 mb-5">
          {/* Logo Section */}
          <div className="absolute left-7 top-3 flex items-center">
          <a href="https://www.iimaginary.com/" target="_blank" rel="noopener noreferrer">
              <img src={logo} alt="Droplets Logo" style={{ height: '40px' }} className="hidden md:inline-block" />
              <span className="hidden md:inline-block text-medium-gray text-l ml-4">RainCloud</span>
          </a>
      </div>
          <div className="w-full md:w-2/3 grid grid-cols-4 text-center text-l">
              <HomeRandomButton />
              <Link to="/explore" className="text-medium-gray hover:text-white p-2 flex justify-center items-center transition-colors duration-300">
                  <FaSearch className="text-icon-lg sm:text-icon-lg md:text-base lg:text-base mr-3 md:mr-5" /><span className="hidden md:inline-block">Explore</span>
              </Link>
              <div className="text-medium-gray hover:text-white p-2 flex justify-center items-center transition-colors duration-300" onClick={openUpload}>
                  <FaUpload className="text-icon-lg sm:text-icon-lg md:text-base lg:text-base mr-3 md:mr-5" /><span className="hidden md:inline-block">Upload</span>
              </div>
              {user ? (
                  <div className="text-medium-gray hover:text-white p-2 flex justify-center items-center transition-colors duration-300">
                      <UserDropdown handleLogout={handleLogout} navigate={navigate} />
                  </div>
              ) : (
                  <div className="text-medium-gray hover:text-white p-2 flex justify-center items-center transition-colors duration-300" onClick={openAuthModal}>
                      <FaSignInAlt className="text-icon-lg sm:text-icon-lg md:text-base lg:text-base mr-3 md:mr-5" /><span className="hidden md:inline-block">Sign In</span>
                  </div>
              )}
          </div>
      </div>

      {isAuthModalOpen && <AuthModal closeModal={closeAuthModal} setNotificationType={setNotificationType} />}
      <TempDataContext.Provider value={{ tempData, setTempData }}>
          <MetadataModal selectedFile={selectedFile} setSelectedFile={setSelectedFile} isOpen={isMetadataModalOpen} closeModal={closeMetadataModal} fetchPatchInfo={fetchPatchInfo} AuthModalClickNext={AuthModalClickNext} />
          <ParametersModal selectedFile={selectedFile} isOpen={isParametersModalOpen} closeModal={closeParametersModal} fetchPatches={fetchPatchInfo} fetchPatchInfo={fetchPatchInfo} setNotificationType={setNotificationType} />
      </TempDataContext.Provider>
      <Setup isLayoutLoaded={isLayoutLoaded} />
      <Suspense fallback={<div>Loading...</div>}>
      <Routes>
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/verify-email/:token" element={<EmailVerification setNotificationType={setNotificationType} />} />
          <Route path="*" element={<HomePage />} />
          <Route path="/explore" element={
              <ExplorePage
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
          <Route path="/help" element={<HelpPage />} />
          <Route path="/manageUploads" element={
                  <RequireAuth>
                    <ManageUploads setNotificationType={setNotificationType} />
                  </RequireAuth>
                }
            />
          <Route
            path="/editLayout/:patchId"
            element={
              <RequireAuth>
                <RequirePatchOwner>
                  <EditLayout setNotificationType={setNotificationType} />
                </RequirePatchOwner>
              </RequireAuth>
            }
          />         
          <Route path="/device/:patchId" element={<DevicePage/>} />
          <Route path="/:username" element={<ArtistPage />} />
          <Route path="/artist/:username" element={<ArtistPage />} />
      </Routes>
      </Suspense>
  </div>
  </ErrorBoundary>
);
        }

export default App;
