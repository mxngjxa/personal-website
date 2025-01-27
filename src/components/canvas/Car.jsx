import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';

import CanvasLoader from '../Loader';

const Car = () => {
  const { scene } = useGLTF('./car/scene.gltf');

  return (
    <mesh>
<hemisphereLight intensity={10} groundColor='black' />
<spotLight
  position={[-5, 10, 5]} // Move closer to the car for better focus
  angle={0.2} // Wider spread for more light
  penumbra={0.5} // Softer edge on the spotlight
  intensity={1000} // Slightly higher intensity to make the car pop
  castShadow
  shadow-mapSize={1024}
/>
<pointLight
  position={[5, 5, 5]} // Add a second point light from the other side for better illumination
  intensity={100} // Slightly less than the spotlight
  color="white" // Neutral white light
/>
<ambientLight intensity={0.3} />

      <primitive
        object={scene}
        rotation={[-0.01, -0.8, -0.2]}
      />
    </mesh>
  );
};

const CarCanvas = () => {
  // State to store the screen width and camera settings
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 500); // Set threshold for small screens (e.g., 768px)
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Run the check on initial load

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Canvas
      frameloop='demand'
      shadows
      camera={{
        position: isSmallScreen ? [0, 1, 6] : [0, 1, 5], // Zoom out a bit on smaller screens
        fov: isSmallScreen ? 2 : 0.35, // Reduce FOV slightly on smaller screens
      }}
    >
      <OrbitControls
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
      <Car />
    </Canvas>
  );
};




export default CarCanvas