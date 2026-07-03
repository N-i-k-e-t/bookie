import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

interface BookMeshProps {
  title: string;
  author: string;
  genre: string;
}

const BookMesh: React.FC<BookMeshProps> = ({ title, author, genre }) => {
  const bookRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  // Generate a dynamic canvas texture for the book cover
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient matching genre/theme
    const grad = ctx.createLinearGradient(0, 0, 0, 768);
    if (genre.toLowerCase() === 'philosophy' || genre.toLowerCase() === 'spirituality') {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#1e1b4b');
    } else if (genre.toLowerCase() === 'business' || genre.toLowerCase() === 'finance') {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#78350f');
      grad.addColorStop(1, '#451a03');
    } else if (genre.toLowerCase() === 'creativity') {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#581c87');
      grad.addColorStop(1, '#3b0764');
    } else {
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 768);

    // Decorative frame/glow lines
    ctx.strokeStyle = '#F59E0B'; // Gold accent
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, 464, 720);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, 440, 696);

    // Subtle background shapes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.arc(256, 384, 180, 0, Math.PI * 2);
    ctx.fill();

    // Brand Label
    ctx.fillStyle = '#8B5CF6';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BOOKIE RECOMENDS', 256, 80);

    // Title
    ctx.fillStyle = '#F9FAFB';
    ctx.font = 'bold 40px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    
    // Simple text wrapping for title
    const words = title.split(' ');
    let line = '';
    let y = 300;
    const lineHeight = 50;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > 400 && n > 0) {
        ctx.fillText(line, 256, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 256, y);

    // Divider line
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(206, y + 40, 100, 4);

    // Author
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'medium 28px "Inter", sans-serif';
    ctx.fillText(author, 256, y + 90);

    // Genre tag at bottom
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillText(genre.toUpperCase(), 256, 680);

    const canvasTexture = new THREE.CanvasTexture(canvas);
    setTexture(canvasTexture);
  }, [title, author, genre]);

  // Rotate and hover animation
  useFrame((state) => {
    if (!bookRef.current) return;
    const t = state.clock.getElapsedTime();
    bookRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    bookRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    bookRef.current.position.y = Math.sin(t * 1.5) * 0.15;
  });

  // Materials definition
  const bookMaterials = useMemo(() => {
    const goldSpine = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.2, metalness: 0.8 });
    const whitePages = new THREE.MeshStandardMaterial({ color: '#E5E7EB', roughness: 0.8 });
    const coverMat = texture 
      ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3, metalness: 0.1 })
      : new THREE.MeshStandardMaterial({ color: '#6366F1', roughness: 0.3 });

    // Materials order for BoxGeometry: [Right, Left, Top, Bottom, Front, Back]
    return [
      whitePages,  // Right page edges
      goldSpine,   // Left spine
      whitePages,  // Top edges
      whitePages,  // Bottom edges
      coverMat,    // Front cover (texture)
      goldSpine    // Back cover
    ];
  }, [texture]);

  return (
    <group ref={bookRef}>
      {/* 3D Book Box */}
      <mesh material={bookMaterials} castShadow receiveShadow>
        <boxGeometry args={[3.2, 4.6, 0.5]} />
      </mesh>
    </group>
  );
};

interface BookReveal3DProps {
  title: string;
  author: string;
  genre: string;
}

export const BookReveal3D: React.FC<BookReveal3DProps> = ({ title, author, genre }) => {
  return (
    <div className="w-full h-[320px] md:h-[400px] cursor-grab active:cursor-grabbing relative rounded-2xl overflow-hidden glass border border-white/5">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={1} castShadow />
        
        <Center>
          <BookMesh title={title} author={author} genre={genre} />
        </Center>
        
        <OrbitControls
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>

      {/* Floating instruction */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-black/60 text-[11px] uppercase tracking-wider text-gray-400 border border-white/5 backdrop-blur-sm">
          Drag to rotate in 3D
        </span>
      </div>
    </div>
  );
};

export default BookReveal3D;
