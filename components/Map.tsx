import React, { useRef, useEffect, useCallback } from 'react';
import { MapStyle } from '../types';

declare const THREE: any;

interface MapProps {
  onMapClick: (x: number, y: number, lat: number, lng: number) => void;
  mapStyle: MapStyle;
  targetCoordinates: { lat: number; lng: number } | null;
}

const TEXTURES = {
    day: 'https://unpkg.com/three-globe@2.27.2/example/img/earth-day.jpg',
    satellite: 'https://unpkg.com/three-globe@2.27.2/example/img/earth-night.jpg',
    topo: 'https://unpkg.com/three-globe@2.27.2/example/img/earth-topology.png',
    ultra: 'https://unpkg.com/three-globe@2.27.2/example/img/earth-blue-marble.jpg',
    clouds: 'https://unpkg.com/three-globe@2.27.2/example/img/earth-clouds.png',
};

const Map: React.FC<MapProps> = ({ onMapClick, mapStyle, targetCoordinates }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Refs for Three.js objects
  // FIX: Initialize useRef hooks with `null` to provide the required initial value.
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const earthMeshRef = useRef<any>(null);
  const cloudMeshRef = useRef<any>(null);
  const textureLoaderRef = useRef<any>(null);

  // Refs for interaction state
  const isDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const initialPinchDistanceRef = useRef(0);
  
  // Refs for animation targets
  const targetRotation = useRef({ x: 0.3, y: 0 }); // Initial rotation
  const targetZoom = useRef(2.5); // Initial zoom

  // Memoize onMapClick to prevent re-renders
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Effect to handle flying to new coordinates from search
  useEffect(() => {
    if (targetCoordinates && earthMeshRef.current) {
        // Convert lat/lng to radians and set as animation target
        targetRotation.current.x = (targetCoordinates.lat * Math.PI) / 180;
        // Adjust longitude for texture map projection
        targetRotation.current.y = (-targetCoordinates.lng * Math.PI) / 180;
        targetZoom.current = 1.6; // Zoom in
    }
  }, [targetCoordinates]);


  // Effect to switch texture when map style changes
  useEffect(() => {
    if (earthMeshRef.current && textureLoaderRef.current && TEXTURES[mapStyle]) {
      earthMeshRef.current.material.map = textureLoaderRef.current.load(TEXTURES[mapStyle]);
      earthMeshRef.current.material.needsUpdate = true;
    }
  }, [mapStyle]);

  // Main setup effect, runs once
  useEffect(() => {
    if (!mountRef.current || typeof THREE === 'undefined') return;

    const mount = mountRef.current;
    
    // Basic scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = targetZoom.current;
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    textureLoaderRef.current = new THREE.TextureLoader();

    // Lighting
    scene.add(new THREE.AmbientLight(0xbbbbbb));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Earth mesh
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        map: textureLoaderRef.current.load(TEXTURES.day),
        bumpMap: textureLoaderRef.current.load(TEXTURES.topo),
        bumpScale: 0.05,
    });
    const earthMesh = new THREE.Mesh(geometry, material);
    earthMesh.rotation.x = targetRotation.current.x;
    scene.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Cloud mesh
    const cloudGeometry = new THREE.SphereGeometry(1.02, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: textureLoaderRef.current.load(TEXTURES.clouds),
        transparent: true,
        opacity: 0.3,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.rotation.x = targetRotation.current.x;
    scene.add(cloudMesh);
    cloudMeshRef.current = cloudMesh;

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Smoothly interpolate (lerp) towards the target state for globe and camera
        earthMesh.rotation.x += (targetRotation.current.x - earthMesh.rotation.x) * 0.1;
        earthMesh.rotation.y += (targetRotation.current.y - earthMesh.rotation.y) * 0.1;
        camera.position.z += (targetZoom.current - camera.position.z) * 0.1;
        
        // Match cloud rotation and add a slow independent drift
        cloudMesh.rotation.x = earthMesh.rotation.x;
        cloudMesh.rotation.y = earthMesh.rotation.y + performance.now() * 0.00002;

        const isSettled = Math.abs(earthMesh.rotation.y - targetRotation.current.y) < 0.0001;
        if (!isDraggingRef.current && isSettled) {
             targetRotation.current.y += 0.0002; // Auto-rotate
        }

        // Enhance detail on zoom
        const zoomLevel = camera.position.z;
        if (zoomLevel < 1.8) {
             earthMesh.material.bumpScale = THREE.MathUtils.lerp(0.1, 0.05, (zoomLevel - 1.5) / (1.8 - 1.5));
        } else {
             earthMesh.material.bumpScale = 0.05;
        }

        renderer.render(scene, camera);
    };
    animate();

    const updateRotationFromDrag = (dx: number, dy: number) => {
        targetRotation.current.y += dx * 0.005;
        targetRotation.current.x += dy * 0.005;
        // Clamp vertical rotation to prevent flipping over the poles
        targetRotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.current.x));
    }
    
    // --- Event Handlers ---
    const onMouseDown = (e: MouseEvent) => { 
        isDraggingRef.current = true;
        wasDraggedRef.current = false;
        previousMousePosition.current = { x: e.offsetX, y: e.offsetY };
    };
    const onMouseUp = () => { 
        isDraggingRef.current = false; 
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      wasDraggedRef.current = true;
      const deltaX = e.offsetX - previousMousePosition.current.x;
      const deltaY = e.offsetY - previousMousePosition.current.y;
      updateRotationFromDrag(deltaX, deltaY);
      previousMousePosition.current = { x: e.offsetX, y: e.offsetY };
    };
    
    const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
            isDraggingRef.current = true;
            wasDraggedRef.current = false;
            previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialPinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        }
    };
    const onTouchEnd = () => {
        isDraggingRef.current = false;
        initialPinchDistanceRef.current = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDraggingRef.current) {
            wasDraggedRef.current = true;
            const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
            updateRotationFromDrag(deltaX, deltaY);
            previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
             const dx = e.touches[0].clientX - e.touches[1].clientX;
             const dy = e.touches[0].clientY - e.touches[1].clientY;
             const newDist = Math.sqrt(dx * dx + dy * dy);
             if (initialPinchDistanceRef.current > 0) {
                 const zoomFactor = initialPinchDistanceRef.current / newDist;
                 targetZoom.current *= zoomFactor;
                 targetZoom.current = THREE.MathUtils.clamp(targetZoom.current, 1.5, 5);
             }
             initialPinchDistanceRef.current = newDist;
        }
    };
    
    const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const zoomSpeed = 0.1;
        targetZoom.current += event.deltaY * zoomSpeed * 0.1;
        targetZoom.current = THREE.MathUtils.clamp(targetZoom.current, 1.5, 5);
    };

    const onClick = (event: MouseEvent) => {
      if (wasDraggedRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(earthMesh);
      if (intersects.length > 0) {
        const localPoint = earthMesh.worldToLocal(intersects[0].point.clone());
        const lat = 90 - (Math.acos(localPoint.y) * 180 / Math.PI); // Assuming radius is 1
        const lng = Math.atan2(localPoint.x, localPoint.z) * 180 / Math.PI;

        onMapClickRef.current(event.clientX, event.clientY, lat, lng);
      }
    };

    const onResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    // Add event listeners
    mount.addEventListener('mousedown', onMouseDown);
    mount.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('mousemove', onMouseMove);
    mount.addEventListener('mouseleave', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });
    mount.addEventListener('click', onClick);
    mount.addEventListener('touchstart', onTouchStart, { passive: true });
    mount.addEventListener('touchend', onTouchEnd);
    mount.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', onResize);
        if (mount && renderer.domElement) {
            // Remove all listeners to prevent memory leaks
            mount.removeEventListener('mousedown', onMouseDown);
            mount.removeEventListener('mouseup', onMouseUp);
            mount.removeEventListener('mousemove', onMouseMove);
            mount.removeEventListener('mouseleave', onMouseUp);
            mount.removeEventListener('wheel', onWheel);
            mount.removeEventListener('click', onClick);
            mount.removeEventListener('touchstart', onTouchStart);
            mount.removeEventListener('touchend', onTouchEnd);
            mount.removeEventListener('touchmove', onTouchMove);
            if (renderer.domElement.parentElement === mount) {
                mount.removeChild(renderer.domElement);
            }
        }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing relative">
        <div ref={mountRef} className="w-full h-full" />
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
            boxShadow: 'inset 0 0 100px #000, 0 0 40px rgba(75, 153, 255, 0.7)'
        }}></div>
    </div>
  );
};

export default Map;