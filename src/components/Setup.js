/* global RNBO */
import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {  setCurrentDevice, selectCurrentDevice, selectPatchNumber } from '../slices/patchInfoSlice';
import { updateRecentlyPlayed, selectUser } from '../slices/userSlice';
import { selectIsUserInteracted } from '../slices/layoutSlice';

const Setup = () => {
    const user = useSelector(selectUser);
    const patchNumber = useSelector(selectPatchNumber);
    const currentDevice = useSelector(selectCurrentDevice); // Use useSelector to get currentDevice from Redux state
    const [context, setContext] = useState(null);
    const isSettingUp = useRef(false);

    const isUserInteracted = useSelector(selectIsUserInteracted); // Use selector from Redux store
    const dispatch = useDispatch();


  // Effect for setting up the application after user interaction and when patchNumber changes
  useEffect(() => {
    const startAudioAfterUserInteraction = async () => {
      if (isUserInteracted) {
        const abortController = new AbortController();
        await setupApplication();
        return () => abortController.abort(); // This will properly abort if setupApplication is in the process
      }
    };

    startAudioAfterUserInteraction();
  }, [isUserInteracted, patchNumber, dispatch]);


    const generateRandomSeedFromCurrentDate = () => {
        const date = new Date();
        // This will get a number between 0 and 999999
        const sixDigitNumber = date.getTime() % 1000000;
        // This will get the last three digits of the above number and convert it back to a fraction
        const lastThreeDigits = sixDigitNumber % 1000;
        return lastThreeDigits / 1000; // Return the number as a fractional part.
    };
    
    const setRandomSeedParameterValue = (device) => {
        const param = device.parameters.find(p => p.name === 'randomSeed');
        if (param) {
            const randomSeedValue = generateRandomSeedFromCurrentDate();
            param.value = randomSeedValue;
            console.log(`randomSeed set to: ${randomSeedValue}.`);
        } else {
            console.log("randomSeed parameter not found in the device.");
        }
    };

    const logRandomSeedParameterValue = () => {
        if (currentDevice) {
            const param = currentDevice.parameters.find(p => p.name === 'randomSeed');
            if (param) {
                console.log(`randomSeed value: ${param.value}`);
            } else {
                console.log("randomSeed parameter not found in the device.");
            }
        } else {
            console.log("Device is not set. Cannot log randomSeed parameter value.");
        }
    };

    const loadRNBOScript = (version) => {
        return new Promise((resolve, reject) => {
            if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
                reject(new Error("Patcher exported with a Debug Version! Please specify the correct RNBO version to use in the code."));
            }

            const el = document.createElement("script");
            el.src = "https://c74-public.nyc3.digitaloceanspaces.com/rnbo/" + encodeURIComponent(version) + "/rnbo.min.js";
            el.onload = () => resolve();
            el.onerror = () => reject();
            document.body.append(el);
        });
    };

    const disconnectDeviceAndContext = () => {
        if (currentDevice) {
            console.log('Disconnecting current device:', currentDevice);
            currentDevice.node.disconnect();
            dispatch(setCurrentDevice(null));  // Use dispatch to update currentDevice in Redux state
        }
        if (context) {
            console.log('Closing audio context');
            context.close();
            setContext(null);
        }
    };







    const setupApplication = async () => {
        console.log('Setting up application...');
    
        if (isSettingUp.current) {
            console.log('A setup is already in progress. Skipping...');
            return;
        }
    
        isSettingUp.current = true;
        disconnectDeviceAndContext();
    
        if (!patchNumber) {
            console.log('Patch number is null. Audio stopped.');
            isSettingUp.current = false;
            return;
        }

        const patchExportURL = "/getPatch/" + patchNumber;
        const WAContext = window.AudioContext || window.webkitAudioContext;
        const newContext = new WAContext();
        setContext(newContext);

        if (newContext.state === 'suspended') {
            await newContext.resume();
        }

        const outputNode = newContext.createGain();
        outputNode.connect(newContext.destination);

        const abortController = new AbortController();
        let response;
        try {
            response = await fetch(patchExportURL, { signal: abortController.signal });
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            }

            console.error('Error while fetching patch data:', error);
            return;
        }

        if (!response.ok) {
            alert('No patch exists for selected input');
            return;
        }

        let patcher;
        try {
            patcher = await response.json();
        } catch (error) {
            console.error('Error while parsing patch data:', error);
            return;
        }

        if (!patcher.desc) {
            console.log('Invalid patch data: Missing "desc" property');
            return;
        }

        if (!window.RNBO) {
            await loadRNBOScript(patcher.desc.meta.rnboversion);
        }

        const newDevice = await RNBO.createDevice({ context: newContext, patcher });
        console.log('New Device Created:', newDevice);

          // Check if the newDevice is actually created
        if (newDevice) {
            dispatch(setCurrentDevice(newDevice)); // This should update the currentDevice state
        }

        // Set randomSeed parameter value during setup
        setRandomSeedParameterValue(newDevice);

        dispatch(setCurrentDevice(newDevice));  // Use dispatch to update currentDevice in Redux state
        newDevice.node.connect(outputNode);

        // Update recentlyPlayed array
        if (user) {
            try {
                const response = await fetch('/updateRecentlyPlayed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: user.id, patchId: patchNumber })
                });
                if (response.ok) {
                    // Update Redux state
                    dispatch(updateRecentlyPlayed(patchNumber));
                }
            } catch (error) {
                console.error('Error updating recently played patches:', error);
            }
        }

        isSettingUp.current = false;
    };

    const updateRecentlyPlayedPatch = async () => {
        if (user && patchNumber) {
            try {
                const response = await fetch('/updateRecentlyPlayed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: user.id, patchId: patchNumber })
                });
                if (response.ok) {
                    // Update Redux state
                    dispatch(updateRecentlyPlayed(patchNumber));
                }
            } catch (error) {
                console.error('Error updating recently played patches:', error);
            }
        }
    };




    useEffect(() => {
        updateRecentlyPlayedPatch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, patchNumber, dispatch]);

    useEffect(() => {
        console.log('Current Device Updated:', currentDevice);
        logRandomSeedParameterValue();  // Log randomSeed parameter value whenever currentDevice is updated
    }, [currentDevice]);

    return null;
};

export default Setup;
