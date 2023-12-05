/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import '../utils/gridColumns.scss';
import 'tailwindcss/tailwind.css';
import EditPatchTitle from './EditPatchTitle';
import EditPatchTitleButtons from './EditPatchTitleButtons';
import Button from '../uiComponents/Button';
import Dial from '../uiComponents/Dial';
import Switch from '../uiComponents/Switch';
import VerticalSlider from '../uiComponents/VerticalSlider';
import HorizontalSlider from '../uiComponents/HorizontalSlider';
import Light from '../uiComponents/Light';
import NumberBox from '../uiComponents/NumberBox';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { store } from '../store';
import { selectPatchNumber, selectCurrentDevice } from '../slices/patchInfoSlice';
import { setEditMode, selectEditMode } from '../slices/modeSlice';
import { setOutportMessage } from '../slices/outportMessagesSlice';
import { selectShowLabel, selectNumColumns, setShowLabel, setNumColumns, selectDropdownNumColumns, selectIsUserInteracted } from '../slices/layoutSlice'; // Import selectors and actions


const EditLayout = ( { setNotificationType } ) => {
  const showLabel = useSelector(selectShowLabel);
  const numColumns = useSelector(selectNumColumns);
  const dropdownNumColumns = useSelector(selectDropdownNumColumns);
  const isUserInteracted = useSelector(selectIsUserInteracted);

  const [UIAssociations, setUIAssociations] = useState([]);
  const [patchMessage, setPatchMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [widgetAssociations, setWidgetAssociations] = useState({});
  const widgetCount = useState(0);
  const editMode = useSelector(selectEditMode);
  const [serializedLayout, setSerializedLayout] = useState(null);
  const [gridInitialized, setGridInitialized] = useState(false);
  const [triggerInit, setTriggerInit] = useState(false);

  const dispatch = useDispatch();
  const patchNumber = useSelector(selectPatchNumber);
  const currentDevice = useSelector(selectCurrentDevice);

  const gridRef = useRef(null);
  const gridStackInstance = useRef(null);
  const rootsMap = useRef(new Map()).current;
  const updateQueue = useRef([]);

  const [gridWidth, setGridWidth] = useState(0); // State to store grid width
  const lastWidth = useRef(0); // Ref to store the last width
  const [responsiveNumColumns, setResponsiveNumColumns] = useState(numColumns);


    // useEffect to handle responsiveness based on gridWidth
    useEffect(() => {
      let updatedNumColumns = numColumns; // Start with current numColumns
  
      if (gridWidth < 375) {
        updatedNumColumns -= 8;
      } else if (gridWidth < 640) {
        updatedNumColumns -= 6;
      } else if (gridWidth < 800) {
        updatedNumColumns -= 4;
      } else if (gridWidth < 1024) {
        updatedNumColumns -= 2;
      }
  
      // Ensure numColumns doesn't go below a certain threshold
      updatedNumColumns = Math.max(updatedNumColumns, 2);
  
      setResponsiveNumColumns(updatedNumColumns); // Update responsive numColumns

    }, [gridWidth, numColumns]);

    // useEffect to log gridWidth changes
useEffect(() => {
  console.log("responsiveNumColumns:",responsiveNumColumns);
}, [responsiveNumColumns]);

  // Function to calculate margin based on window width
  const calculateMargin = (width) => {
    if (width < 375) {
      return 2; // Smaller margin for very small widths
    } else if (width < 640) {
      return 2; // Slightly larger margin
    } else if (width < 800) {
      return 4; // And so on...
    } else if (width < 1024) {
      return 6;
    }
    return 10; // Default margin for larger widths
  };

  // Function to apply changes to grid stack including margins
  const applyGridStackChanges = () => {
    const latestUpdate = updateQueue.current.pop(); 
    updateQueue.current = [];

    if (latestUpdate && gridStackInstance.current) {
      // Update cell height and columns
      gridStackInstance.current.cellHeight(latestUpdate.cellHeight);
      gridStackInstance.current.column(latestUpdate.effectiveNumColumns);

      // Update margin
      const newMargin = calculateMargin(gridWidth);
      gridStackInstance.current.margin(newMargin);
    }
  };


// Function to update gridWidth
const updateGridWidth = () => {
  if (gridRef.current) {
    const currentWidth = gridRef.current.offsetWidth;
    if (currentWidth !== lastWidth.current) {
      setGridWidth(currentWidth); // Update state
      lastWidth.current = currentWidth;
    }
  }
};

// useEffect to log gridWidth changes
useEffect(() => {
  console.log("Grid width changed:", gridWidth);
}, [gridWidth]);

// Add window resize listener to update gridWidth
useEffect(() => {
  window.addEventListener("resize", updateGridWidth);

  // Initial update
  updateGridWidth();

  // Cleanup
  return () => {
    window.removeEventListener("resize", updateGridWidth);
  };
}, []); // Empty dependency array ensures this runs once on mount


  const resizeGrid = useCallback(() => {
    if (!gridInitialized || !gridRef.current) {
      return; // Do not proceed if the grid is not initialized or if the grid ref is not attached
    }
  
    const effectiveNumColumns = responsiveNumColumns; // Use responsiveNumColumns instead of numColumns
    const cellWidth = Math.round(gridRef.current.offsetWidth / effectiveNumColumns);
    const cellHeight = cellWidth;
  
    updateQueue.current.push({ cellHeight, effectiveNumColumns });
    setTimeout(applyGridStackChanges, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridInitialized, responsiveNumColumns, gridWidth]); // Include gridWidth in dependencies

  
  
// Only run the initialization when the user has interacted
useEffect(() => {
  let isCancelled = false; // Flag to indicate if the effect cleanup has run

  if (isUserInteracted) {
    // Define a delayed initialization function
    const init = async () => {
      await initializeGrid();
      fetchUIAssociations();
    };

    // Set a timeout to delay the initialization
    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        init();
      }
    }, 500); // Adjust the delay as needed

    return () => {
      isCancelled = true; // Set the flag to true to indicate cleanup
      clearTimeout(timeoutId); // Clear the timeout to prevent the init function from being called

      if (isUserInteracted) {
        window.removeEventListener('resize', resizeGrid);
        setGridInitialized(false);
        // Unsubscribe and destroy handlers as needed
        if (currentDevice?.messageEvent) {
          currentDevice.messageEvent.unsubscribe(subscribeToOutportMessages);
        }
        // destroyAllEventHandlers(); // If defined
      }
    };
  }
}, [isUserInteracted, patchNumber, numColumns, dropdownNumColumns, responsiveNumColumns]); // Removed resizeGrid from the dependencies


useEffect(() => {
  if (UIAssociations.length > 0) {
    loadInitialLayout();
  }
}, [UIAssociations]);
  


  const initializeGrid = useCallback(() => {
    dispatch(setEditMode(true));
  
    console.log('grid initialised, num columns: ', numColumns)
  
    gridStackInstance.current = GridStack.init({
      column: numColumns,
      animate: false,
      disableOneColumnMode: true,
      float: true,
      draggable: { ignoreContent: true },
      resizable: {
        handles: 'e,se,s,sw,w',
        ignoreContent: true,
      },
    }, gridRef.current);
    removeAllWidgets();
    setGridInitialized(true); // Set the flag here
  
    resizeGrid();
    window.addEventListener('resize', resizeGrid);
    console.log('grid initialised, num columns: ', numColumns)
  }, [ dispatch, resizeGrid]);


  useEffect(() => {
    resizeGrid();
  }, [showLabel, resizeGrid]);


  useEffect(() => {
    const gridStack = gridStackInstance.current;
    if (!gridStack) return;

    if (editMode) {
      console.log('gridstack Enabled');
      gridStack.enable();
    } else {
      console.log('gridstack Disabled');
      gridStack.disable();
    }
  }, [editMode]);

  const fetchUIAssociations = async () => {
    console.log("FetchUiAssociations called");
    if (!patchNumber) return;

    setUIAssociations([]);

    try {
      const response = await fetch(`/getUIassociations/${patchNumber}`);
      if (response.ok) {
        const data = await response.json();
        const formattedData = Object.keys(data).map(key => ({
          id: key,
          type: data[key]
        }));
        setUIAssociations(formattedData);
        console.log("UI Associations: ", formattedData);
      } else {
        console.error("Error fetching UI Associations: Response not OK");
      }
    } catch (error) {
      console.error("Error fetching UI Associations:", error);
    }
  };

  const fetchAndProcessGridData = async (layoutData) => {
    let widgets = [];
    try {
      const response = await fetch(`/getLayout/${patchNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
    const serializedData = layoutData.layout; // Directly use the layout data instead of fetching again
        widgets = processSerializedData(serializedData);
      } else {
        widgets = UIAssociations.map(association => ({
          id: getWidgetId(association.type, association.id),
          w: association.type === 'vslider' ? 1 :
          (association.type === 'hslider' ? 3 :
          (association.type === 'dial' ? 1 : 
          (association.type === 'switch' ? 1 : 1))),  // Adding switch option
          h: association.type === 'vslider' ? 3 : 1,
          association
      }));
      }
    } catch (error) {
      console.error('Error fetching layout:', error);
    }

    return widgets;
  };

  const processSerializedData = (serializedData) => {
    if (serializedData && serializedData.length > 0) {
        return serializedData.map(data => {
  
            let association;
            if (data.association) {
                association = data.association;
            } else {
                association = {
                    id: data.id.split('-')[1], // Assuming id format: 'type-id'
                    type: data.id.split('-')[0] // Assuming id format: 'type-id'
                };
            }
  
            return {
                ...data,
                association
            };
        });
    }
    return [];
  }

  const loadInitialLayout = async () => {
    console.log('loadInitialLayout: Function has been called.');
  
    if (!patchNumber) {
      console.log('loadInitialLayout: No patchNumber provided, setting patch message and stopping execution.');
      setPatchMessage("No patch loaded");
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`/getLayout/${patchNumber}`);
      console.log('loadInitialLayout: Response received from the server.');
  
      if (response.ok) {
        console.log('loadInitialLayout: Server response is OK, proceeding to process the response.');
        const layoutData = await response.json();
        console.log('loadInitialLayout: JSON data parsed from response:', layoutData);
  
        if (layoutData && typeof layoutData.numColumns !== 'undefined' && typeof layoutData.showLabels !== 'undefined') {
          // Store the server value in a variable
          const serverNumColumns = layoutData.numColumns || 16; // default to 16 if null or undefined
          const showLabel = layoutData.showLabels !== null ? layoutData.showLabels : true; // default to true if null
    
          // Decide which value to use for numColumns
          // Use dropdownNumColumns if non-null, otherwise use serverNumColumns
          let numColumnsToUse;
          if (dropdownNumColumns !== null && dropdownNumColumns !== undefined) {
            numColumnsToUse = dropdownNumColumns;
          } else {
            numColumnsToUse = serverNumColumns;
          }
    
          // Dispatch the decided value to the Redux store
          dispatch(setNumColumns(numColumnsToUse));
          dispatch(setShowLabel(showLabel));
        }
  
        if (!layoutData.layout || !Array.isArray(layoutData.layout) || layoutData.layout.length === 0) {
          console.log('loadInitialLayout: No layout found in the data, generating default widgets.');
          generateWidgets();
        } else {
          const widgets = await fetchAndProcessGridData(layoutData); // Ensure this function expects the raw array
          loadWidgetsToGrid(widgets);
        }
        
      } else {
        console.error("loadInitialLayout: Error fetching layout data - server response not OK.");
        generateWidgets(); // Fallback to generating widgets
      }
    } catch (error) {
      console.error("loadInitialLayout: Caught error fetching layout data:", error);
      generateWidgets(); // Fallback to generating widgets in case of error
    } finally {
      console.log('loadInitialLayout: Setting loading state to false.');
      setLoading(false);
    }
  };
  
  
  const loadWidgetsToGrid = widgetsToLoad => {
    console.log('Widgets to load: ', widgetsToLoad);
    
    if (!gridStackInstance.current) {
      console.warn("GridStack not initialized yet.");
      return;
    }
    
    // Check if there are widgets before attempting to remove them
    if (gridStackInstance.current.engine.nodes.length > 0) {
      try {
        gridStackInstance.current.removeAll();
      } catch (error) {
        console.error("Error removing widgets from grid:", error);
        return; // Early return on error
      }
    }
    
    // Proceed to add new widgets
    widgetsToLoad.forEach(widgetData => {
      try {
        setWidgetAssociations(prevAssociations => ({
          ...prevAssociations,
          [widgetData.id]: widgetData.association
        }));
        addWidgetWithAttributes(widgetData);
      } catch (error) {
        console.error(`Error adding widget with id ${widgetData.id}:`, error);
        // Depending on your error handling strategy, you might choose to continue adding other widgets or return early.
      }
    });
  };
  
  
  const addWidgetWithAttributes = widgetData => {
    const elContent = `<div id="${widgetData.id}" style="width:100%; height:100%;"></div>`;
    const widgetContainer = addWidgetToGridWithAttributes(
      widgetData.association.type,
      widgetData.id,
      elContent,
      widgetData.w,
      widgetData.h,
      widgetData.x,
      widgetData.y
    );
    renderWidget(widgetData.id, widgetContainer, widgetData.association);
  };
  
  const addWidgetToGridWithAttributes = (type, id, content, w, h, x, y) => {
    gridStackInstance.current.addWidget({
      w: w,
      h: h,
      x: x,
      y: y,
      content: content,
      autoPosition: !x && !y  // If x and y are not provided, we autoPosition the widget.
    });
    return document.getElementById(id);
  };
  

  const generateWidgets = () => {
    console.log('generateWidgets called');
    
    if (!gridStackInstance.current) {
      console.warn('GridStack not initialized yet. Skipping widget generation.');
      return;
    }
  
    console.log('UIAssociations:', UIAssociations);
    const newWidgetAssociations = UIAssociations.reduce((acc, association, index) => {
      const widgetId = getWidgetId(association.type, index);
      addWidget(association, widgetId);
      acc[widgetId] = association;
      return acc;
    }, {});
  
    console.log('Final widgetAssociations:', newWidgetAssociations);
    setWidgetAssociations(newWidgetAssociations);
  };
  
  const addWidget = (association, widgetId) => {
    const elContent = `<div id="${widgetId}" style="width:100%; height:100%;"></div>`;
    const widgetContainer = addWidgetToGrid(association.type, widgetId, elContent);
    renderWidget(widgetId, widgetContainer, association);
  };
  

  const removeAllWidgets = () => {
    // Check if gridStackInstance.current is initialized
    if (gridStackInstance.current) {
      gridStackInstance.current.removeAll();
    } else {
      console.warn('GridStack instance is not initialized.');
    }
  
    // Check and unmount roots before clearing the rootsMap
    rootsMap.forEach((root, element) => {
      const containerElement = document.getElementById(element);
      if (containerElement && root) {
        root.unmount();
      }
    });
    rootsMap.clear();
  };
  

  const getWidgetId = (type, index) => `${type}${index + 1}`;

  const addWidgetToGrid = (type, id, content) => {
    const width = type === 'hslider' ? 3 : 1;
    const height = type === 'vslider' ? 3 : 1;

    gridStackInstance.current.addWidget({
        w: width,
        h: height,
        content,
        autoPosition: true,
    });
    return document.getElementById(id);
};

  const subscribeToOutportMessages = useCallback(() => {
    if (!currentDevice) return;
    const outports = currentDevice.outports || [];
    if (currentDevice.messageEvent) {
      currentDevice.messageEvent.subscribe((ev) => {
        if (outports.findIndex(elt => elt.tag === ev.tag) < 0) return;
        
        // Dispatch to the Redux store
        dispatch(setOutportMessage(ev));
      });
    }
  }, [currentDevice, dispatch]);

  useEffect(() => {
    if (!currentDevice) return;
  
    subscribeToOutportMessages();
  
    // Unsubscribe when the component unmounts or currentDevice changes
    return () => {
      if (currentDevice?.messageEvent) {
        currentDevice.messageEvent.unsubscribe(subscribeToOutportMessages);
      }
    };
  }, [currentDevice, subscribeToOutportMessages]);


  const saveGrid = async () => {
    const serializedData = gridStackInstance.current.save();
  
    serializedData.forEach((widgetData, index) => {
      // Extract original id from the content string
      const match = widgetData.content.match(/id="([^"]+)"/);
      const widgetId = match ? match[1] : `widget${widgetCount + index + 1}`;
      console.log('Widget id on save:', widgetId);
    
      // Lookup association based on widget id
      const association = widgetAssociations[widgetId];
      if (association) {
        widgetData.association = association;  // Update this line to store the whole association object
        widgetData.id = widgetId;  // Store widgetId in widgetData
      }
    });

    setSerializedLayout(serializedData);
    console.log('saved data', serializedData);
  


    try {
        const response = await fetch(`/updateLayout/${patchNumber}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                layout: serializedData,
                numColumns: numColumns,
                showLabel: showLabel
            })
        });

        const responseText = await response.text();
  
        if (response.ok) {
            console.log('Update response:', responseText);
            setNotificationType('Save layout successful');

        } else {
            console.error("Server responded with an error:", responseText);
            setNotificationType('Save layout failed');

        }        
    } catch (error) {
        console.error('Error saving layout to DB:', error);
        setNotificationType('Save layout failed');

    }
};

const handleCancel = () => {
  // Toggle the trigger to re-run the initialization useEffect
  setTriggerInit(prev => !prev);
};

  const handleSliderChange = (paramId, targetValue) => {
    const param = currentDevice?.parameters.find(p => p.id === paramId);
    if (param) {
      console.log(param.id, ' set to: ', param.value);
      param.value = targetValue;
    }
  };

  const handleDialChange = (paramId, targetValue) => {
    const param = currentDevice?.parameters.find(p => p.id === paramId);
    if (param) {
      console.log(param.id, ' set to: ', param.value);
      param.value = targetValue;
    }
};

  const handleButtonClick = (paramId) => {
    const param = currentDevice?.parameters.find(p => p.id === paramId);
    if (param) {
      param.value = param.max;
      setTimeout(() => param.value = param.min, 40);
    }
  };

  const handleSwitchClick = (paramId) => {
    const param = currentDevice?.parameters.find(p => p.id === paramId);
    if (param) {
      // If the current value is min, set to max and vice versa
      param.value = (param.value === param.min) ? param.max : param.min;
    }
  };

  const initializeEventHandlers = (widgetId, association) => {
    // Event handlers are initialized based on the widget type
    if (widgetId.startsWith('button')) {
      return {
        onPress: () => handleButtonClick(association.id),
        handleButtonClick: handleButtonClick.bind(null, association.id),
      };
    } else if (widgetId.startsWith('switch')) {
      return {
        onChange: () => handleSwitchClick(association.id),
        handleSwitchClick: handleSwitchClick.bind(null, association.id),
      };
    } else if (widgetId.startsWith('dial')) {
      return {
        onChange: (value) => handleDialChange(association.id, value),
        onValueChange: handleDialChange.bind(null, association.id),
      };
    } else if (widgetId.startsWith('vslider')) {
      return {
        onChange: (value) => handleSliderChange(association.id, value),
        onValueChange: handleSliderChange.bind(null, association.id),
      };
    } else if (widgetId.startsWith('hslider')) {
      return {
        onChange: (value) => handleSliderChange(association.id, value),
        onValueChange: handleSliderChange.bind(null, association.id),
      };
    } else if (widgetId.startsWith('light')) {
      // Light widgets might not have interactive event handlers but you can add them if needed
      return {};
    } else if (widgetId.startsWith('numberBox')) {
      // Number box specific event handlers can be added here
      return {};
    } else {
      // If the widget type is unknown or not handled, return an empty object or log a warning
      console.warn(`No event handlers for widget type: ${widgetId}`);
      return {};
    }
  };
  
// Define a function that conditionally attaches event handlers to the widgets
const attachEventHandlers = useCallback((widgetId, association, ComponentType) => {
  const eventHandlers = initializeEventHandlers(widgetId, association);
  const root = rootsMap.get(document.getElementById(widgetId));
  if (root) {
    root.render(
      <Provider store={store}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <ComponentType
            {...eventHandlers}
            id={association.id}
            name={association.id}
          />
        </div>
      </Provider>
    );
  }
}, [initializeEventHandlers, rootsMap]);
  
  const renderWidget = useCallback((widgetId, widgetEl, association) => {
    let ComponentType;
    if (widgetId.startsWith('button')) {
      ComponentType = Button;
    } else if (widgetId.startsWith('switch')) {
        ComponentType = Switch;
    } else if (widgetId.startsWith('dial')) {
        ComponentType = Dial;
    } else if (widgetId.startsWith('vslider')) {
      ComponentType = VerticalSlider;
    } else if (widgetId.startsWith('hslider')) {
      ComponentType = HorizontalSlider;
    } else if (widgetId.startsWith('light')) {
      ComponentType = Light;
    } else if (widgetId.startsWith('numberBox')) {
      ComponentType = NumberBox;
    }
  
    let root = rootsMap.get(widgetEl);
    if (!root) {
      root = ReactDOM.createRoot(widgetEl);
      rootsMap.set(widgetEl, root);
    }
  
  
  // Render the widget without event handlers initially
  root.render(
    <Provider store={store}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ComponentType
          id={association.id}
          name={association.id}
        />
      </div>
    </Provider>
  );
}, []);
  
// Define a function that maps widgetId to the corresponding React component
const getComponentTypeFromWidgetId = (widgetId) => {
  // Match the beginning of widgetId to the corresponding component
  if (widgetId.startsWith('button')) {
    return Button;
  } else if (widgetId.startsWith('switch')) {
    return Switch;
  } else if (widgetId.startsWith('dial')) {
    return Dial;
  } else if (widgetId.startsWith('vslider')) {
    return VerticalSlider;
  } else if (widgetId.startsWith('hslider')) {
    return HorizontalSlider;
  } else if (widgetId.startsWith('light')) {
    return Light;
  } else if (widgetId.startsWith('numberBox')) {
    return NumberBox;
  }
  // Log a warning if the component type is not found
  console.warn(`No component found for widget type: ${widgetId}`);
  return null;
};

  // useEffect to conditionally attach event handlers when currentDevice is ready and user has interacted
  useEffect(() => {
    if (isUserInteracted && currentDevice) {
      Object.entries(widgetAssociations).forEach(([widgetId, association]) => {
        const ComponentType = getComponentTypeFromWidgetId(widgetId);
        if (ComponentType) {
          attachEventHandlers(widgetId, association, ComponentType);
        }
      });
    }
  }, [isUserInteracted, currentDevice, attachEventHandlers, widgetAssociations]);

  // Replace the loading conditional with a check for patchNumber
  if (!isUserInteracted && patchNumber) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button 
            className="py-2 px-4 m-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded"
          >
            Start
          </button>
      </div>
    );
  }

  return (
    <div key={numColumns} style={{ width: '100%' }} className={`pb-64`}>
        <EditPatchTitle 
            onSave={saveGrid} 
            onCancel={handleCancel} 
        />
        <div className="flex justify-center">
            <p>{patchMessage}</p>
            {loading && <p>Loading...</p>}
        </div>
        <div ref={gridRef} className={`grid-stack gs-${numColumns}`}
            style={{ 
                visibility: loading ? 'hidden' : 'visible', 
            }}>
            <style>
            {`
                .interact-mode .ui-resizable-handle {
                    display: none;
                }
            `}
            </style>
        </div>
        <div key={numColumns} style={{ width: '100%' }} className="fixed inset-x-0 bottom-0">
          <EditPatchTitleButtons 
              onSave={saveGrid} 
              onCancel={handleCancel} 
          />
        </div>
    </div>
  );
}

export default EditLayout;