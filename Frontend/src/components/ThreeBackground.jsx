import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x071c46, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 12);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(4, 5, 5);
    scene.add(ambientLight, directionalLight);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.TorusGeometry(3.2, 0.18, 32, 120);
    const material = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      metalness: 0.5,
      roughness: 0.15,
      emissive: 0x1f54aa,
      emissiveIntensity: 0.28,
      opacity: 0.85,
      transparent: true,
    });
    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.x = Math.PI * 0.25;
    torus.rotation.y = Math.PI * 0.18;
    group.add(torus);

    const sphereGeo = new THREE.IcosahedronGeometry(1.25, 2);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.35,
      roughness: 0.18,
      emissive: 0x7fbfff,
      emissiveIntensity: 0.16,
      transparent: true,
      opacity: 0.92,
      flatShading: true,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 160;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xcbd5e1,
      size: 0.14,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    const clock = new THREE.Clock();
    const tick = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.y = elapsed * 0.18;
      group.rotation.x = Math.sin(elapsed * 0.24) * 0.08;
      particles.rotation.y = elapsed * 0.05;
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    tick();

    return () => {
      window.removeEventListener('resize', resize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
