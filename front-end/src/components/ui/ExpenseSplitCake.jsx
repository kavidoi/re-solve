import React, { useState, useEffect, useMemo } from 'react';
import { CakeIcon } from '@heroicons/react/24/solid';

const MAX_SLICES_PER_PERSON = 5;

// Colors matching the app's design
const COLORS = [
  '#4f46e5', // primary indigo
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f97316', // orange
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f59e0b'  // amber
];

const ExpenseSplitCake = ({ 
  participants, 
  totalAmount, 
  onSplitChange 
}) => {
  // State to track each participant's share data
  const [participantShares, setParticipantShares] = useState([]);
  const [highlightedParticipantId, setHighlightedParticipantId] = useState(null);
  // State to track hover index for slice selection
  const [hoveredSlice, setHoveredSlice] = useState({ id: null, count: 0 });
  
  // Initialize participant shares with equal distribution
  useEffect(() => {
    if (participants && participants.length > 0 && totalAmount > 0) { // Added check for totalAmount > 0
      const equalShare = 100 / participants.length;
      const shares = participants.map((participant, index) => ({ // Added index for stable ID
        id: participant.id || `participant-${index}`, // Use provided ID or generate one
        name: participant.name,
        included: true,
        percentage: equalShare,
        amount: (totalAmount * equalShare) / 100,
        slices: 1, // Default equal slices
        color: getParticipantColor(index), // Assign color based on index for stability
      }));
      
      setParticipantShares(shares);
      // DO NOT call onSplitChange here - it causes the infinite loop
      // onSplitChange(shares); // Report initial split to parent
    } else {
       // Reset shares if participants or amount is invalid
       setParticipantShares([]);
    }
  // Ensure dependencies are stable. participants object structure should be consistent.
  // Consider using JSON.stringify for deep comparison if needed, but it's often better
  // to ensure stable references from the parent.
  }, [participants, totalAmount]); 

  // Calculate if we should show cake visualizations
  const { shouldShowMainCake, shouldShowMiniCakes, hasFractionalSlices } = useMemo(() => {
    if (!participantShares.length) return { shouldShowMainCake: false, shouldShowMiniCakes: false, hasFractionalSlices: false };
    
    // Check if any participant has more than MAX_SLICES_PER_PERSON slices
    const hasExcessiveSlices = participantShares.some(p => p.included && p.slices > MAX_SLICES_PER_PERSON);
    
    // Check if any participant has fractional slices
    const hasFractionalSlices = participantShares.some(p => p.included && p.slices % 1 !== 0);
    
    return {
      shouldShowMainCake: !hasFractionalSlices,
      shouldShowMiniCakes: !hasExcessiveSlices && !hasFractionalSlices,
      hasFractionalSlices
    };
  }, [participantShares]);

  // Update participant shares when a checkbox is toggled
  const handleIncludeToggle = (participantId) => {
    let updatedShares = participantShares.map(share => {
      if (share.id === participantId) {
        return { ...share, included: !share.included };
      }
      return share;
    });
    
    // Recalculate percentages for included participants
    const includedParticipants = updatedShares.filter(p => p.included);
    const numIncluded = includedParticipants.length;
    
    if (numIncluded > 0) {
      const equalShare = 100 / numIncluded;
      updatedShares = updatedShares.map(share => {
        if (share.included) {
          return {
            ...share,
            percentage: equalShare,
            amount: (totalAmount * equalShare) / 100,
            slices: 1 // Reset to equal slices
          };
        }
        return {
          ...share,
          percentage: 0,
          amount: 0,
          slices: 0
        };
      });
    } else {
       // If no one is included, reset everyone
       updatedShares = updatedShares.map(share => ({ ...share, percentage: 0, amount: 0, slices: 0 }));
    }
      
    setParticipantShares(updatedShares);
    onSplitChange(updatedShares); // Report change to parent
  };

  // Add a slice to a participant
  const handleAddSlice = (participantId) => {
    // First check if adding a slice would exceed maximum
    const participant = participantShares.find(p => p.id === participantId);
    if (!participant || !participant.included || participant.slices >= MAX_SLICES_PER_PERSON) return;
    
    // Calculate total slices for redistribution
    let totalSlices = participantShares.reduce((acc, p) => acc + (p.included ? p.slices : 0), 0);
    totalSlices += 1; // Account for the new slice being added
    
    const updatedShares = participantShares.map(share => {
      if (share.id === participantId) { // Already checked included status
        // Increase this participant's slices
        const newSlices = share.slices + 1;
        const newPercentage = (newSlices / totalSlices) * 100;
        return {
          ...share,
          slices: newSlices,
          percentage: newPercentage,
          amount: (totalAmount * newPercentage) / 100
        };
      } else if (share.included) {
        // Recalculate percentages for other included participants
        const newPercentage = (share.slices / totalSlices) * 100;
        return {
          ...share,
          percentage: newPercentage,
          amount: (totalAmount * newPercentage) / 100
        };
      }
      return share; // Return unchanged if not included
    });
        
    setParticipantShares(updatedShares);
    onSplitChange(updatedShares); // Report change to parent
  };

  // Handle direct percentage input
  const handlePercentageChange = (participantId, newPercentageStr) => {
    // Ensure percentage is a valid number
    const percentValue = parseFloat(newPercentageStr);
    if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) return; // Basic validation

    const otherIncludedParticipants = participantShares.filter(p => p.included && p.id !== participantId);
    const numOtherIncluded = otherIncludedParticipants.length;
    const maxPossibleForOthers = 100 - percentValue;

    if (numOtherIncluded === 0 && percentValue !== 100) {
       // Only this person is included, must be 100%
       // Optionally show an error or force to 100?
       return; 
    }

    // Calculate new shares
    let updatedShares = participantShares.map(share => {
      if (share.id === participantId) {
          // Approximate slices based on percentage (might result in fractional slices)
          const approximateSlices = percentValue / (100 / participantShares.filter(p => p.included).length);
          return {
              ...share,
              percentage: percentValue,
              amount: (totalAmount * percentValue) / 100,
              slices: approximateSlices
          };
      }
      return share;
  });

    // Distribute remaining percentage among others proportionally
    const remainingPercentage = 100 - percentValue;
    let distributedTotal = 0;
    let indicesToAdjust = [];
    let currentOtherTotal = 0;

    otherIncludedParticipants.forEach((p, index) => {
        currentOtherTotal += p.percentage;
        indicesToAdjust.push(participantShares.findIndex(share => share.id === p.id));
    });

    updatedShares = updatedShares.map((share, index) => {
      if (indicesToAdjust.includes(index)) {
        const originalShareOfOtherTotal = currentOtherTotal === 0 ? (1 / numOtherIncluded) : (share.percentage / currentOtherTotal);
        let newPercentage = remainingPercentage * originalShareOfOtherTotal;
        
        // Crude rounding handling - add remainder to last element
        if (index === indicesToAdjust[indicesToAdjust.length - 1]) {
            newPercentage = remainingPercentage - distributedTotal;
        }
        
        distributedTotal += newPercentage;
        const approximateSlices = newPercentage / (100 / participantShares.filter(p => p.included).length);

        return {
            ...share,
            percentage: newPercentage,
            amount: (totalAmount * newPercentage) / 100,
            slices: approximateSlices
        };
      }
      return share;
    });

    setParticipantShares(updatedShares);
    onSplitChange(updatedShares); // Report change to parent
};

  // Handle setting slices directly (clicking a specific slice)
  const handleSetSlices = (participantId, newSlices) => {
    if (newSlices < 0 || newSlices > MAX_SLICES_PER_PERSON) return;
    let totalSlices = participantShares.reduce((acc, p) => acc + (p.included ? p.slices : 0), 0);
    const current = participantShares.find(p => p.id === participantId)?.slices || 0;
    totalSlices = totalSlices - current + newSlices;
    if (totalSlices <= 0) return;
    const updatedShares = participantShares.map(share => {
      if (!share.included) return share;
      if (share.id === participantId) {
        const percentage = (newSlices / totalSlices) * 100;
        return { ...share, slices: newSlices, percentage, amount: (totalAmount * percentage) / 100 };
      } else {
        const percentage = (share.slices / totalSlices) * 100;
        return { ...share, percentage, amount: (totalAmount * percentage) / 100 };
      }
    });
    setParticipantShares(updatedShares);
    onSplitChange(updatedShares);
  };

  // Assign a color based on participant index for stability
  function getParticipantColor(index) {
    // Use modulo to wrap around if more participants than colors
    return COLORS[index % COLORS.length];
  }

  // Render the main cake visualization
  const renderMainCake = () => {
    if (!shouldShowMainCake) return null;
    
    const includedParticipants = participantShares.filter(p => p.included);
    if (includedParticipants.length === 0) return null; // Don't render cake if no one is included
    const totalSlices = includedParticipants.reduce((acc, p) => acc + p.slices, 0);
    if (totalSlices <= 0) return null; // Avoid division by zero
    
    return (
      <div className="flex flex-col items-center mb-4" aria-label="Expense share visualization">
        {/* Smaller cake with shadow effect and interaction */}
        <div 
          className="relative w-36 h-36 rounded-full overflow-hidden mb-4 shadow-lg group"
          onMouseLeave={() => setHighlightedParticipantId(null)} // Clear highlight when mouse leaves cake area
        >
          {/* Render cake slices as circular segments with individual animations */}
          {includedParticipants.map((participant, index) => {
            // Calculate degrees for this participant's slices
            const degrees = (participant.slices / totalSlices) * 360;
            // Calculate starting angle based on previous participants
            const startAngle = includedParticipants
              .slice(0, index)
              .reduce((acc, p) => acc + (p.slices / totalSlices) * 360, 0);
            
            const isHighlighted = highlightedParticipantId === participant.id;
            
            return (
              <div 
                key={participant.id}
                className={`absolute w-full h-full transform-gpu cursor-pointer`}
                style={{
                  backgroundColor: participant.color,
                  clipPath: `conic-gradient(from ${startAngle}deg, currentColor ${degrees}deg, transparent ${degrees}deg)`,
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: isHighlighted ? 'brightness(1.2) drop-shadow(0 0 4px rgba(255,255,255,0.6))' : 'brightness(1)',
                  transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                  zIndex: isHighlighted ? 10 : 1 // Ensure highlighted is on top
                }}
                onMouseEnter={() => setHighlightedParticipantId(participant.id)}
                aria-label={`${participant.name}'s share: ${participant.percentage.toFixed(0)}%`}
              />
            );
          })}
          
          {/* Slice divider lines for visual separation - subtle */}
          {includedParticipants.length > 1 && includedParticipants.map((_, index) => {
            if (index === 0) return null;  // Skip first divider
            
            // Calculate angle for this divider
            const angle = includedParticipants
              .slice(0, index)
              .reduce((acc, p) => acc + (p.slices / totalSlices) * 360, 0);
              
            return (
              <div
                key={`divider-${index}`}
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.2)', // More subtle divider
                  width: '50%',
                  height: '50%',
                  transformOrigin: 'bottom left',
                  transform: `rotate(${angle}deg)`,
                  left: '50%',
                  top: '0',
                  zIndex: 5 // Below highlighted slice, above others
                }}
              />
            );
          })}
          
          {/* Add a center decoration - subtle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-inner z-20" />
          </div>
        </div>
        
        {/* Legend for the cake - interactive */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xs" role="list" aria-label="Participant color legend">
          {includedParticipants.map(participant => (
            <div 
              key={participant.id} 
              className={`flex items-center px-2 py-1 rounded-full bg-secondary dark:bg-gray-700 border border-accent dark:border-gray-600 shadow-sm cursor-pointer transition-all duration-200 ${highlightedParticipantId === participant.id ? 'ring-2 ring-offset-1 dark:ring-offset-gray-800' : ''}`}
              role="listitem"
              style={{ 
                borderLeftColor: participant.color, 
                borderLeftWidth: '3px',
                ringColor: participant.color, // Dynamic ring color
                transform: highlightedParticipantId === participant.id ? 'scale(1.05)' : 'scale(1)' 
              }}
              onMouseEnter={() => setHighlightedParticipantId(participant.id)}
              onMouseLeave={() => setHighlightedParticipantId(null)}
            >
              <span 
                className="w-3 h-3 rounded-full mr-1.5" // Slightly more spacing
                style={{ backgroundColor: participant.color }}
                aria-hidden="true"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">{participant.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render mini-cake icons for a participant - interactive
  const renderMiniCakes = (participant) => {
    if (!shouldShowMiniCakes || !participant.included) return null;
    const filledCount = Math.floor(participant.slices);
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: MAX_SLICES_PER_PERSON }, (_, i) => {
          const idx = i + 1;
          // Determine if this slice is filled (consider hover)
          const isHoveredGroup = hoveredSlice.id === participant.id;
          const targetCount = isHoveredGroup ? hoveredSlice.count : filledCount;
          const filled = idx <= targetCount;
          return (
            <button
              key={idx}
              type="button"
              onMouseEnter={() => setHoveredSlice({ id: participant.id, count: idx })}
              onMouseLeave={() => setHoveredSlice({ id: null, count: 0 })}
              onClick={() => handleSetSlices(participant.id, idx)}
              className="p-1 focus:outline-none"
              style={{ background: 'transparent' }}
              aria-label={`Set ${participant.name} to ${idx} of ${MAX_SLICES_PER_PERSON} slices`}
            >
              <span
                role="img"
                aria-hidden="true"
                style={{
                  color: filled ? participant.color : '#ccc',
                  transform: filled && isHoveredGroup ? 'scale(1.3)' : 'scale(1)',
                  filter: isHoveredGroup && filled ? 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' : 'none'
                }}
                className="text-xl transition-all duration-200"
              >
                🍰
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // Render percentage bar - interactive
  const renderPercentageBar = (participant) => {
    if (!participant.included) return null;
    
    const isHighlighted = highlightedParticipantId === participant.id;
    
    return (
      <div 
        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative cursor-pointer group"
        onMouseEnter={() => setHighlightedParticipantId(participant.id)}
        onMouseLeave={() => setHighlightedParticipantId(null)}
      >
        <div 
          className="h-full rounded-full transition-all duration-300 ease-in-out absolute left-0 top-0"
          style={{ 
            width: `${participant.percentage}%`,
            backgroundColor: participant.color,
            filter: isHighlighted ? 'brightness(1.1)' : 'brightness(1)',
            boxShadow: isHighlighted ? `0 0 6px ${participant.color}` : 'none'
          }}
          aria-hidden="true"
        />
        {/* Add a subtle glow effect on hover */}
        <div 
          className={`absolute inset-0 rounded-full transition-opacity duration-300 opacity-0 ${isHighlighted ? 'opacity-100' : ''}`}
          style={{ boxShadow: `0 0 8px ${participant.color}` }}
          aria-hidden="true"
        />
      </div>
    );
  };

  // If no participants, show a message
  if (!participantShares.length) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 p-4">
        No participants to split with.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning message for fractional slices */}
      {hasFractionalSlices && (
        <div
          className="text-center text-amber-500 text-xs mb-2 bg-amber-50 dark:bg-amber-900/20 py-1 px-2 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <span aria-hidden="true">⚠️</span> Exact proportions cannot be visually represented.
        </div>
      )}
      {/* ARIA live region for fallback text (hidden visually, but announced) */}
      <div className="sr-only" aria-live="polite">
        {hasFractionalSlices ? 'Exact proportions cannot be visually represented.' : ''}
      </div>
      
      {/* Main cake visualization */}
      {renderMainCake()}
      
      {/* Participants list */}
      <div className="space-y-3 bg-secondary dark:bg-gray-700/50 p-3 rounded-lg">
        {participantShares.map(participant => {
          const isHighlighted = highlightedParticipantId === participant.id;
          return (
            <div 
              key={participant.id} 
              className={`flex flex-col space-y-1.5 rounded-md transition-all duration-200 ${isHighlighted ? 'bg-gray-100 dark:bg-gray-700 p-1.5 -m-1.5 ring-1 ring-inset' : ''}`}
              style={{ ringColor: isHighlighted ? participant.color : 'transparent' }}
              onMouseEnter={() => setHighlightedParticipantId(participant.id)}
              onMouseLeave={() => setHighlightedParticipantId(null)}
            >
              <div className="flex items-center justify-between">
                {/* Checkbox and name */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`participant-${participant.id}`}
                    checked={participant.included}
                    onChange={() => handleIncludeToggle(participant.id)}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mr-1 min-w-[32px] min-h-[32px]"
                    onFocus={() => setHighlightedParticipantId(participant.id)} // Highlight on focus
                    onBlur={() => setHighlightedParticipantId(null)}
                  />
                  <label 
                    htmlFor={`participant-${participant.id}`} 
                    className="text-sm font-medium cursor-pointer"
                    style={{ color: participant.color }}
                  >
                    {participant.name}
                  </label>
                </div>

                {/* Mini cakes */}
                {renderMiniCakes(participant)}
                
                {/* Amount and percentage */}
                <div className="flex flex-col items-end text-xs">
                  <span className="font-medium">${participant.amount.toFixed(0)}</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={participant.included ? participant.percentage.toFixed(0) : "0"}
                      onChange={(e) => handlePercentageChange(participant.id, e.target.value)}
                      disabled={!participant.included}
                      className={`w-10 p-0.5 text-center text-xs border rounded dark:text-white transition-all duration-200 ${isHighlighted ? 'border-primary dark:border-primary ring-1 ring-primary dark:bg-gray-600' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'}`}
                      aria-label={`${participant.name}'s percentage share`}
                      onFocus={() => setHighlightedParticipantId(participant.id)}
                      onBlur={() => setHighlightedParticipantId(null)}
                    />
                    <span className="text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
              </div>
              
              {/* Percentage bar visualization */}
              {renderPercentageBar(participant)}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default ExpenseSplitCake; 