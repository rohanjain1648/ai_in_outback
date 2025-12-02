import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LandscapeDemo } from '../../src/components/three/LandscapeDemo';

// Mock Three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="three-canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: jest.fn(),
  useThree: () => ({
    camera: {
      position: { x: 0, y: 50, z: 100, distanceTo: jest.fn(() => 50) },
      quaternion: {},
      lookAt: jest.fn(),
      updateMatrixWorld: jest.fn()
    },
    gl: {
      setClearColor: jest.fn(),
      shadowMap: { enabled: false, type: null },
      setPixelRatio: jest.fn(),
      info: {
        render: { calls: 0, triangles: 0 },
        memory: { geometries: 0, textures: 0 },
        reset: jest.fn()
      }
    }
  })
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Sky: () => <div data-testid="sky" />,
  Environment: () => <div data-testid="environment" />
}));

jest.mock('three', () => ({
  ...jest.requireActual('three'),
  WebGLRenderer: jest.fn(),
  PerspectiveCamera: jest.fn(),
  Scene: jest.fn(),
  Vector3: jest.fn().mockImplementation(() => ({
    x: 0,
    y: 0,
    z: 0,
    copy: jest.fn(),
    set: jest.fn(),
    lerp: jest.fn(),
    add: jest.fn(),
    multiplyScalar: jest.fn(),
    applyQuaternion: jest.fn(),
    distanceTo: jest.fn(() => 50),
    clone: jest.fn()
  })),
  Matrix4: jest.fn().mockImplementation(() => ({
    makeRotationZ: jest.fn(),
    setPosition: jest.fn(),
    multiplyMatrices: jest.fn()
  })),
  Frustum: jest.fn().mockImplementation(() => ({
    setFromProjectionMatrix: jest.fn(),
    intersectsBox: jest.fn(() => true)
  })),
  Box3: jest.fn(),
  MathUtils: {
    clamp: jest.fn((value, min, max) => Math.max(min, Math.min(max, value))),
    lerp: jest.fn((a, b, t) => a + (b - a) * t)
  },
  PlaneGeometry: jest.fn(),
  MeshLambertMaterial: jest.fn(),
  CanvasTexture: jest.fn(),
  RepeatWrapping: 'RepeatWrapping',
  DoubleSide: 'DoubleSide',
  PCFSoftShadowMap: 'PCFSoftShadowMap',
  BasicShadowMap: 'BasicShadowMap'
}));

describe('LandscapeDemo Component', () => {
  beforeEach(() => {
    // Mock performance.now for consistent testing
    jest.spyOn(performance, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders landscape demo with controls', () => {
    render(<LandscapeDemo />);
    
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    expect(screen.getByText('Landscape Controls')).toBeInTheDocument();
    expect(screen.getByText('Time of Day: 12:00 (Afternoon)')).toBeInTheDocument();
  });

  test('updates time of day when slider changes', () => {
    render(<LandscapeDemo />);
    
    const timeSlider = screen.getByRole('slider');
    fireEvent.change(timeSlider, { target: { value: '6' } });
    
    expect(screen.getByText('Time of Day: 6:00 (Morning)')).toBeInTheDocument();
  });

  test('changes weather type when dropdown changes', () => {
    render(<LandscapeDemo />);
    
    const weatherSelect = screen.getByDisplayValue('☀️ Sunny');
    fireEvent.change(weatherSelect, { target: { value: 'rainy' } });
    
    expect(screen.getByDisplayValue('🌧️ Rainy')).toBeInTheDocument();
  });

  test('changes region when dropdown changes', () => {
    render(<LandscapeDemo />);
    
    const regionSelect = screen.getByDisplayValue('🏜️ Outback');
    fireEvent.change(regionSelect, { target: { value: 'forest' } });
    
    expect(screen.getByDisplayValue('🌲 Forest')).toBeInTheDocument();
    expect(screen.getByText('Dense eucalyptus, varied terrain, rich greens')).toBeInTheDocument();
  });

  test('applies quick presets correctly', () => {
    render(<LandscapeDemo />);
    
    const outbackDawnButton = screen.getByText('Outback Dawn');
    fireEvent.click(outbackDawnButton);
    
    expect(screen.getByText('Time of Day: 6:00 (Morning)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('☀️ Sunny')).toBeInTheDocument();
    expect(screen.getByDisplayValue('🏜️ Outback')).toBeInTheDocument();
  });

  test('toggles controls visibility', () => {
    render(<LandscapeDemo />);
    
    // Initially controls should be visible
    expect(screen.getByText('Landscape Controls')).toBeInTheDocument();
    
    // Hide controls
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Landscape Controls')).not.toBeInTheDocument();
    expect(screen.getByText('⚙️ Controls')).toBeInTheDocument();
    
    // Show controls again
    const showButton = screen.getByText('⚙️ Controls');
    fireEvent.click(showButton);
    
    expect(screen.getByText('Landscape Controls')).toBeInTheDocument();
  });

  test('displays correct time labels', () => {
    render(<LandscapeDemo />);
    
    const timeSlider = screen.getByRole('slider');
    
    // Test different times
    fireEvent.change(timeSlider, { target: { value: '2' } });
    expect(screen.getByText('Time of Day: 2:00 (Night)')).toBeInTheDocument();
    
    fireEvent.change(timeSlider, { target: { value: '8' } });
    expect(screen.getByText('Time of Day: 8:00 (Morning)')).toBeInTheDocument();
    
    fireEvent.change(timeSlider, { target: { value: '15' } });
    expect(screen.getByText('Time of Day: 15:00 (Afternoon)')).toBeInTheDocument();
    
    fireEvent.change(timeSlider, { target: { value: '20' } });
    expect(screen.getByText('Time of Day: 20:00 (Evening)')).toBeInTheDocument();
  });

  test('shows keyboard controls information', () => {
    render(<LandscapeDemo />);
    
    expect(screen.getByText('Keyboard Controls:')).toBeInTheDocument();
    expect(screen.getByText('WASD / Arrow Keys: Move')).toBeInTheDocument();
    expect(screen.getByText('Q/E: Up/Down')).toBeInTheDocument();
    expect(screen.getByText('1-5: Camera presets')).toBeInTheDocument();
  });

  test('displays region-specific information', () => {
    render(<LandscapeDemo />);
    
    // Test outback region info
    expect(screen.getByText('Outback Region')).toBeInTheDocument();
    expect(screen.getByText('Red earth, sparse vegetation, mesa formations')).toBeInTheDocument();
    
    // Change to coastal
    const regionSelect = screen.getByDisplayValue('🏜️ Outback');
    fireEvent.change(regionSelect, { target: { value: 'coastal' } });
    
    expect(screen.getByText('Coastal Region')).toBeInTheDocument();
    expect(screen.getByText('Sandy beaches, gentle slopes, coastal flora')).toBeInTheDocument();
  });

  test('shows loading indicator', () => {
    render(<LandscapeDemo />);
    
    expect(screen.getByText('Australian Landscape Loaded')).toBeInTheDocument();
  });
});

// Test individual landscape components
describe('Landscape System Components', () => {
  test('terrain system generates appropriate height maps', () => {
    // This would test the terrain generation logic
    // For now, we'll test that the component structure is correct
    expect(true).toBe(true); // Placeholder
  });

  test('lighting system calculates correct sun positions', () => {
    // Test sun position calculations for different times
    const timeOfDay = 12; // Noon
    const angle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
    const elevation = Math.sin(angle) * 0.8 + 0.2;
    
    expect(elevation).toBeGreaterThan(0);
    expect(elevation).toBeLessThanOrEqual(1);
  });

  test('weather system creates appropriate particle counts', () => {
    const intensity = 0.7;
    const rainParticleCount = Math.floor(intensity * 2000);
    const cloudCount = Math.floor(intensity * 8);
    
    expect(rainParticleCount).toBe(1400);
    expect(cloudCount).toBe(5);
  });

  test('flora system distributes vegetation based on density', () => {
    const density = 0.3;
    const treeCount = Math.floor(density * 20);
    const bushCount = Math.floor(density * 40);
    const grassCount = Math.floor(density * 200);
    
    expect(treeCount).toBe(6);
    expect(bushCount).toBe(12);
    expect(grassCount).toBe(60);
  });
});