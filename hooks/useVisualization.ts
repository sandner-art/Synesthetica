import { useRef, useEffect, useState, useCallback } from 'react';
// FIX: Import EvaluatedFunction from types.ts to resolve circular dependency.
import type { ProjectionModeId, EvaluatedFunction } from '../types';
import { visualizationModules } from '../visualizations';

interface VisualizationParams {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mode: ProjectionModeId;
  algorithm: string;
  parameters: Record<string, number>;
  isPlaying: boolean;
  parsedFunction: EvaluatedFunction | null;
  useAdaptiveCentering: boolean;
  controlsHeight: number;
}

export const useVisualization = ({ canvasRef, mode, algorithm, parameters, isPlaying, parsedFunction, useAdaptiveCentering, controlsHeight }: VisualizationParams) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false); // For rotation
  const [isPanning, setIsPanning] = useState(false);   // For panning
  
  const dragStartRef = useRef({ x: 0, y: 0 });

  // For multi-touch (pinch/pan) interactions
  const multiTouchRef = useRef<{ 
      lastPinchDistance: number | null,
      lastMidpoint: {x: number, y: number} | null
  }>({ lastPinchDistance: null, lastMidpoint: null });

  const animationFrameId = useRef<number | null>(null);
  const timeRef = useRef(0);
  const visualizationStateRef = useRef<any>({});

  const resetView = useCallback(() => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);
  
  // MOUSE HANDLERS
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) { // Left button for rotation
      setIsDragging(true);
    } else if (e.button === 1) { // Middle button for panning
      e.preventDefault();
      setIsPanning(true);
    }
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isPanning) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (isDragging) {
      setRotation(prev => ({
        x: prev.x + deltaY * 0.005,
        y: prev.y + deltaX * 0.005
      }));
    }
    
    if (isPanning) {
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
  }, []);

  // TOUCH HANDLERS
  const getPinchDistance = (touches: TouchList) => {
      return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  }
  const getMidpoint = (touches: TouchList) => {
      return {
          x: (touches[0].clientX + touches[1].clientX) / 2,
          y: (touches[0].clientY + touches[1].clientY) / 2
      };
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      setIsDragging(false); // Stop rotation if a second finger is added
      e.preventDefault(); // Prevent default browser gestures (like page zoom)
      multiTouchRef.current = {
          lastPinchDistance: getPinchDistance(e.touches),
          lastMidpoint: getMidpoint(e.touches)
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;
      setRotation(prev => ({
        x: prev.x + deltaY * 0.005,
        y: prev.y + deltaX * 0.005
      }));
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && multiTouchRef.current.lastMidpoint) {
      e.preventDefault();
      
      // Panning with two fingers
      const currentMidpoint = getMidpoint(e.touches);
      const panDeltaX = currentMidpoint.x - multiTouchRef.current.lastMidpoint!.x;
      const panDeltaY = currentMidpoint.y - multiTouchRef.current.lastMidpoint!.y;
      setPanOffset(prev => ({ x: prev.x + panDeltaX, y: prev.y + panDeltaY }));
      multiTouchRef.current.lastMidpoint = currentMidpoint;

      // Zooming (pinch) with two fingers
      const currentPinchDistance = getPinchDistance(e.touches);
      if (multiTouchRef.current.lastPinchDistance) {
        const zoomDelta = currentPinchDistance / multiTouchRef.current.lastPinchDistance;
        setZoom(prev => Math.max(0.2, Math.min(5, prev * zoomDelta)));
      }
      multiTouchRef.current.lastPinchDistance = currentPinchDistance;
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      multiTouchRef.current = { lastPinchDistance: null, lastMidpoint: null };
    }
    if (e.touches.length < 1) {
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // If one finger is lifted, restart drag for the remaining finger to avoid jumps
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.2, Math.min(5, prev * delta)));
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Touch listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // Zoom listener
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Prevent context menu on middle/right click
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    canvas.addEventListener('contextmenu', preventContextMenu);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel, canvasRef]);

  // Effect for initializing stateful visualizations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const module = visualizationModules[mode];
    if (module && module.init) {
        visualizationStateRef.current = module.init({ canvas, parameters, algorithm });
    } else {
        visualizationStateRef.current = {}; // Reset for modes without init
    }
  }, [mode, algorithm, parameters, canvasRef]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const render = (time: number) => {
        if (isPlaying) {
            timeRef.current = time * 0.001;
        }
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const yOffset = useAdaptiveCentering ? -controlsHeight / 2 : 0;

        ctx.save();
        ctx.translate(rect.width / 2 + panOffset.x, rect.height / 2 + yOffset + panOffset.y);
        ctx.scale(zoom, zoom);
        ctx.rotate(rotation.y);
        
        const module = visualizationModules[mode];
        if (module) {
          module.render({
            ctx,
            t: timeRef.current,
            f: parsedFunction || (() => 0),
            p: parameters,
            state: visualizationStateRef.current,
            width: rect.width,
            height: rect.height,
            zoom,
            rotation,
            algorithm,
          });
        }
        
        ctx.restore();
        animationFrameId.current = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mode, algorithm, parameters, isPlaying, parsedFunction, rotation, zoom, panOffset, canvasRef, useAdaptiveCentering, controlsHeight]);
  
  return { rotation, zoom, resetView };
};