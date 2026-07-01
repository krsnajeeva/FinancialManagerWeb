import React, { useState, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import Icon from './Icon';

interface SwipeableProps {
  children: React.ReactNode;
  onDelete: () => void | Promise<void>;
  borderRadius?: number;
  containerStyle?: React.CSSProperties;
  swipeEnabled?: boolean;
  backgroundColor?: string;
}

const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onDelete,
  borderRadius = 12,
  containerStyle,
  swipeEnabled = true,
  backgroundColor,
}) => {
  const theme = useTheme();
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentTranslateX = useRef(0);
  const deleteBtnWidth = 72;

  const handleStart = (clientX: number) => {
    if (!swipeEnabled) return;
    setIsSwiping(true);
    startX.current = clientX;
    currentTranslateX.current = translateX;
  };

  const handleMove = (clientX: number) => {
    if (!isSwiping) return;
    const diff = clientX - startX.current;
    let newTranslateX = currentTranslateX.current + diff;

    // Prevent swiping right, and restrict excess left swipe
    if (newTranslateX > 0) {
      newTranslateX = 0;
    } else if (newTranslateX < -deleteBtnWidth - 20) {
      newTranslateX = -deleteBtnWidth - 20;
    }
    setTranslateX(newTranslateX);
  };

  const handleEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    
    if (translateX < -deleteBtnWidth / 2) {
      setTranslateX(-deleteBtnWidth);
    } else {
      setTranslateX(0);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);
  const onTouchEnd = handleEnd;

  const onMouseDown = (e: React.MouseEvent) => {
    // Only capture left click
    if (e.button !== 0) return;
    handleStart(e.clientX);
    
    const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
      handleMove(moveEvent.clientX);
    };
    
    const handleGlobalMouseUp = () => {
      setIsSwiping(false);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      
      setTranslateX((prev) => {
        if (prev < -deleteBtnWidth / 2) {
          return -deleteBtnWidth;
        }
        return 0;
      });
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTranslateX(-500);
    setTimeout(() => {
      onDelete();
      setTranslateX(0);
    }, 200);
  };

  return (
    <div
      style={{
        position: 'relative',
        margin: '4px 0',
        overflow: 'hidden',
        borderRadius: `${borderRadius}px`,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexShrink: 0,
        ...containerStyle,
      }}
    >
      {/* Background delete action container */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          backgroundColor: 'transparent',
          zIndex: 0,
        }}
      >
        <button
          onClick={handleDelete}
          style={{
            width: '60px',
            height: '92%',
            marginRight: '8px',
            backgroundColor: '#FF3B30',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            borderRadius: `${borderRadius}px`,
            color: '#FFFFFF',
          }}
          className="active-opacity"
        >
          <Icon name="trash-can-outline" size={24} color="#FFFFFF" />
        </button>
      </div>

      {/* Foreground item card */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        style={{
          width: '100%',
          backgroundColor: backgroundColor || theme.cardBackground,
          borderRadius: `${borderRadius}px`,
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          zIndex: 1,
          cursor: swipeEnabled ? 'grab' : 'default',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Swipeable;
