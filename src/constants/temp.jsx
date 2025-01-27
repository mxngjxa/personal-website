const Car = () => {
    const { scene } = useGLTF('./car/scene.gltf');
  
    return (
      <mesh>
        <hemisphereLight intensity={0.15} groundColor='black' />
        <spotLight
          position={[-20, 50, 10]}
          angle={0.12}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize={1024}
        />
        <pointLight intensity={1} />
        <primitive
          object={scene}
          rotation={[-0.01, -0.2, -0.1]}
        />
      </mesh>
    );
  };
  
  const CarCanvas = () => {
    return (
      <Canvas
        frameloop="demand"
        shadows
        dpr={[1, 2]}
        camera={{ position: [20, 3, 5], fov: 25 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <Car />
        </Suspense>
  
        <Preload all />
      </Canvas>
    )
  };