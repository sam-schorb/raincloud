/* global RNBO */
import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectPatchNumber } from '../slices/patchInfoSlice';
import { updateRecentlyPlayed, selectUser } from '../slices/userSlice';

const Setup = () => {
    const user = useSelector(selectUser);
    const patchNumber = useSelector(selectPatchNumber);
    const dispatch = useDispatch();
    const [currentDevice, setCurrentDevice] = useState(null);
    const [context, setContext] = useState(null);
    const isSettingUp = useRef(false);

    const generateRandomSeedFromCurrentDate = () => {
        const date = new Date();
        return (date.getTime() % 1000000) / 1000000; // A random integer derived from the current time.
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
            setCurrentDevice(null);
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

        // Set randomSeed parameter value during setup
        setRandomSeedParameterValue(newDevice);

        setCurrentDevice(newDevice);
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
        const abortController = new AbortController();
        setupApplication();
        return () => abortController.abort(); // This will properly abort if setupApplication is in the process
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patchNumber]);


    useEffect(() => {
        updateRecentlyPlayedPatch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, patchNumber, dispatch]);

    useEffect(() => {
        console.log('Current Device Updated:', currentDevice);
    }, [currentDevice]);

    return null;
};

export default Setup;