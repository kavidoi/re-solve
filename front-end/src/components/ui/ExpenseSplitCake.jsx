import React, { useState, useEffect, useMemo } from 'react';

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
    // Just toggle included, do not recalc others
    let updatedShares = participantShares.map(share =>
      share.id === participantId ? { ...share, included: !share.included } : share
    );
    setParticipantShares(updatedShares);
    if (typeof onSplitChange === 'function') onSplitChange(updatedShares);
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
    if (typeof onSplitChange === 'function') onSplitChange(updatedShares); // Report change to parent
  };

  // --- New local state for editing percentages ---
  const [editingPercentages, setEditingPercentages] = useState({});

  // Handle direct percentage input (edit only, don't enforce yet)
  const handlePercentageEdit = (participantId, value) => {
    setEditingPercentages(prev => ({ ...prev, [participantId]: value }));
  };

  // On blur or Enter, enforce 100% and update shares
  const commitPercentageChange = (participantId) => {
    const editValue = editingPercentages[participantId];
    const percentValue = parseFloat(editValue);
    if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
      // Reset to actual value if invalid
      setEditingPercentages(prev => ({ ...prev, [participantId]: undefined }));
      return;
    }
    const included = participantShares.filter(p => p.included);
    const others = included.filter(p => p.id !== participantId);
    const otherTotal = others.reduce((sum, p) => sum + p.percentage, 0);
    const remainder = 100 - percentValue;
    // Distribute remainder proportionally to others
    let distributed = 0;
    let updatedShares = participantShares.map((share, idx) => {
      if (!share.included) return { ...share, percentage: 0, amount: 0 };
      if (share.id === participantId) {
        const slices = percentValue / (100 / included.length);
        return { ...share, percentage: percentValue, amount: (totalAmount * percentValue) / 100, slices };
      }
      // Proportional distribution
      let newPerc = otherTotal > 0 ? (share.percentage / otherTotal) * remainder : remainder / others.length;
      // Ensure last gets the rounding error
      if (share.id === others[others.length - 1]?.id) newPerc = remainder - distributed;
      distributed += newPerc;
      const slices = newPerc / (100 / included.length);
      return { ...share, percentage: newPerc, amount: (totalAmount * newPerc) / 100, slices };
    });
    setParticipantShares(updatedShares);
    setEditingPercentages(prev => ({ ...prev, [participantId]: undefined }));
    if (typeof onSplitChange === 'function') onSplitChange(updatedShares);
  };


  // Handle setting slices directly (clicking a specific slice)
  const handleSetSlices = (participantId, newSlices) => {
    if (newSlices < 0 || newSlices > MAX_SLICES_PER_PERSON) return;
    // Only update the relevant participant's slices and percentage, do NOT recalc others
    const updatedShares = participantShares.map(share => {
      if (!share.included) return share;
      if (share.id === participantId) {
        // Recalc percentage for this participant only, based on their new slices and total included slices
        const included = participantShares.filter(p => p.included);
        const totalSlices = included.reduce((acc, p) => acc + (p.id === participantId ? newSlices : p.slices), 0);
        const percentage = (newSlices / totalSlices) * 100;
        return { ...share, slices: newSlices, percentage, amount: (totalAmount * percentage) / 100 };
      }
      return share;
    });
    setParticipantShares(updatedShares);
    if (typeof onSplitChange === 'function') onSplitChange(updatedShares);
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
        {/* Main cake visualization using conic-gradient */}
        {(() => {
          const gradientSegments = includedParticipants.map((participant, index) => {
            const startAngle = includedParticipants
              .slice(0, index)
              .reduce((sum, p) => sum + p.slices, 0) / totalSlices * 360;
            const sliceAngle = (participant.slices / totalSlices) * 360;
            const endAngle = startAngle + sliceAngle;
            return `${participant.color} ${startAngle.toFixed(2)}deg ${endAngle.toFixed(2)}deg`;
          }).join(', ');
          
          return (
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden mb-2 border border-accent dark:border-gray-600 bg-secondary dark:bg-gray-700"
              style={{
                backgroundImage: `conic-gradient(from 0deg, ${gradientSegments})`,
                transition: 'background-image 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              aria-label="Expense share visualization"
            />
          );
        })()}
      </div>
    );
  };

  // Render mini-cake icons for a participant - interactive
  const renderMiniCakes = (participant) => {
    if (!shouldShowMiniCakes || !participant.included) return null;
    const filledCount = Math.floor(participant.slices);
    return (
      <div className="flex items-center space-x-1" role="group" aria-label={`${participant.name} slice controls`}>
        {Array.from({ length: MAX_SLICES_PER_PERSON }, (_, i) => {
          const idx = i + 1;
          const isHovered = hoveredSlice.id === participant.id && hoveredSlice.count === idx;
          const isSelected = idx <= (hoveredSlice.id === participant.id ? hoveredSlice.count : filledCount);
          return (
            <button
              key={idx}
              type="button"
              onMouseEnter={() => setHoveredSlice({ id: participant.id, count: idx })}
              onMouseLeave={() => setHoveredSlice({ id: null, count: 0 })}
              onClick={() => handleSetSlices(participant.id, idx)}
              className="p-1 focus:ring-2 focus:ring-offset-1 focus:ring-primary"
              style={{ background: 'transparent' }}
              aria-label={`Set ${participant.name} to ${idx} of ${MAX_SLICES_PER_PERSON} slices`}
            >
              <span
                role="img"
                aria-hidden="true"
                style={{
                  color: isSelected ? participant.color : '#3b82f6',
                  opacity: isSelected ? 1 : 0.5,
                  transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                  filter: isHovered ? 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' : 'none'
                }}
                className="text-xl transition-all duration-200"
              >🍰</span>
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
      {/* Announce when mini-cakes are hidden due to excessive slices */}
      <div className="sr-only" aria-live="polite">
        {(!shouldShowMiniCakes && !hasFractionalSlices) ? 'Mini-cake icons hidden: a participant has more than maximum slices.' : ''}
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
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 mr-1 min-w-[32px] min-h-[32px]"
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
                      value={editingPercentages[participant.id] !== undefined ? editingPercentages[participant.id] : (participant.included ? participant.percentage.toFixed(0) : "0")}
                      onChange={e => handlePercentageEdit(participant.id, e.target.value)}
                      onBlur={() => { commitPercentageChange(participant.id); setHighlightedParticipantId(null); }}
                      onKeyDown={e => { if (e.key === 'Enter') { commitPercentageChange(participant.id); e.target.blur(); } }}
                      disabled={!participant.included}
                      className={`w-10 p-0.5 text-center text-xs border rounded dark:text-white transition-all duration-200 ${isHighlighted ? 'border-primary dark:border-primary ring-1 ring-primary dark:bg-gray-600' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'}`}
                      aria-label={`${participant.name}'s percentage share`}
                      onFocus={() => setHighlightedParticipantId(participant.id)}
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