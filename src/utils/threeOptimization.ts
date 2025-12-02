/**
 * Three.js Performance Optimization Utilities
 * 
 * Provides utilities for optimizing Three.js scenes, managing LOD,
 * object pooling, and efficient rendering techniques.
 */

import * as THREE from 'three';

// Performance monitoring for Three.js
export class ThreePerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private frameTime = 0;
  private memoryUsage = 0;
  private renderCalls = 0;
  private triangles = 0;

  constructor(private renderer: THREE.WebGLRenderer) {}

  update() {
    const currentTime = performance.now();
    this.frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.frameCount++;
    
    if (this.frameCount % 60 === 0) {
      this.fps = Math.round(1000 / this.frameTime);
      this.updateRenderStats();
      this.updateMemoryStats();
    }
  }

  private updateRenderStats() {
    const info = this.renderer.info;
    this.renderCalls = info.render.calls;
    this.triangles = info.render.triangles;
  }

  private updateMemoryStats() {
    const info = this.renderer.info;
    this.memoryUsage = info.memory.geometries + info.memory.textures;
  }

  getStats() {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      memoryUsage: this.memoryUsage,
      renderCalls: this.renderCalls,
      triangles: this.triangles,
      timestamp: Date.now()
    };
  }

  shouldReduceQuality() {
    return this.fps < 30 || this.frameTime > 33.33;
  }

  shouldIncreaseQuality() {
    return this.fps > 55 && this.frameTime < 16;
  }
}

// Level of Detail (LOD) Manager
export class LODManager {
  private lodObjects = new Map<THREE.Object3D, LODConfig>();
  private camera: THREE.Camera;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
  }

  addLODObject(object: THREE.Object3D, config: LODConfig) {
    this.lodObjects.set(object, config);
  }

  update() {
    for (const [object, config] of this.lodObjects) {
      const distance = this.camera.position.distanceTo(object.position);
      this.updateObjectLOD(object, distance, config);
    }
  }

  private updateObjectLOD(object: THREE.Object3D, distance: number, config: LODConfig) {
    let currentLevel = 0;
    
    for (let i = 0; i < config.distances.length; i++) {
      if (distance > (config.distances[i] || 0)) {
        currentLevel = i + 1;
      }
    }

    // Hide object if too far
    if (currentLevel >= config.levels.length) {
      object.visible = false;
      return;
    }

    object.visible = true;
    
    // Apply LOD level
    const level = config.levels[currentLevel];
    if (level && level.geometry && object instanceof THREE.Mesh) {
      object.geometry = level.geometry;
    }
    
    if (level && level.material && object instanceof THREE.Mesh) {
      object.material = level.material;
    }
  }
}

interface LODConfig {
  distances: number[];
  levels: Array<{
    geometry?: THREE.BufferGeometry;
    material?: THREE.Material;
  }>;
}

// Object Pooling System
export class ObjectPool<T extends THREE.Object3D> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createFn());
    }
  }

  get(): T {
    let obj: T;
    
    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.createFn();
    }
    
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.resetFn(obj);
      this.available.push(obj);
    }
  }

  clear() {
    this.available.forEach(obj => (obj as any).dispose?.());
    this.inUse.forEach(obj => (obj as any).dispose?.());
    this.available = [];
    this.inUse.clear();
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

// Frustum Culling Helper
export class FrustumCuller {
  private frustum = new THREE.Frustum();
  private matrix = new THREE.Matrix4();

  constructor(private camera: THREE.Camera) {}

  update() {
    this.matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.matrix);
  }

  isVisible(object: THREE.Object3D): boolean {
    const mesh = object as THREE.Mesh;
    if (!mesh.geometry) return true;
    
    const boundingSphere = mesh.geometry.boundingSphere;
    if (!boundingSphere) return true;
    
    const worldSphere = boundingSphere.clone();
    worldSphere.applyMatrix4(object.matrixWorld);
    
    return this.frustum.intersectsSphere(worldSphere);
  }

  cullObjects(objects: THREE.Object3D[]) {
    for (const object of objects) {
      object.visible = this.isVisible(object);
    }
  }
}

// Texture Optimization
export class TextureOptimizer {
  private textureCache = new Map<string, THREE.Texture>();
  // Compression support detection would go here in a full implementation

  constructor(private renderer: THREE.WebGLRenderer) {
    // Compression support would be initialized here
  }

  private checkCompressionSupport() {
    const gl = this.renderer.getContext();
    return {
      s3tc: !!gl.getExtension('WEBGL_compressed_texture_s3tc'),
      pvrtc: !!gl.getExtension('WEBGL_compressed_texture_pvrtc'),
      etc1: !!gl.getExtension('WEBGL_compressed_texture_etc1'),
      astc: !!gl.getExtension('WEBGL_compressed_texture_astc')
    };
  }

  optimizeTexture(texture: THREE.Texture, options: TextureOptimizationOptions = {}) {
    const {
      maxSize = 1024,
      generateMipmaps = true,
      format = THREE.RGBAFormat,
      minFilter = THREE.LinearMipmapLinearFilter,
      magFilter = THREE.LinearFilter
    } = options;

    // Resize if too large
    if (texture.image && (texture.image.width > maxSize || texture.image.height > maxSize)) {
      texture.image = this.resizeImage(texture.image, maxSize);
    }

    texture.format = format;
    texture.generateMipmaps = generateMipmaps;
    texture.minFilter = minFilter;
    texture.magFilter = magFilter as THREE.MagnificationTextureFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
  }

  private resizeImage(image: HTMLImageElement | HTMLCanvasElement, maxSize: number) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const scale = Math.min(maxSize / image.width, maxSize / image.height);
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  getCachedTexture(url: string): THREE.Texture | undefined {
    return this.textureCache.get(url);
  }

  setCachedTexture(url: string, texture: THREE.Texture) {
    this.textureCache.set(url, texture);
  }

  clearCache() {
    for (const texture of this.textureCache.values()) {
      texture.dispose();
    }
    this.textureCache.clear();
  }
}

interface TextureOptimizationOptions {
  maxSize?: number;
  generateMipmaps?: boolean;
  format?: THREE.PixelFormat;
  minFilter?: THREE.TextureFilter;
  magFilter?: THREE.TextureFilter;
}

// Geometry Optimization
export class GeometryOptimizer {
  static optimizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    // Clone geometry for optimization
    geometry = geometry.clone();
    
    // Compute vertex normals if missing
    if (!geometry.attributes['normal']) {
      geometry.computeVertexNormals();
    }
    
    // Compute bounding sphere for frustum culling
    geometry.computeBoundingSphere();
    
    return geometry;
  }

  static createLODGeometry(originalGeometry: THREE.BufferGeometry, reductionFactor: number): THREE.BufferGeometry {
    // Simple vertex reduction (in a real implementation, you'd use a proper decimation algorithm)
    const positionAttribute = originalGeometry.attributes['position'];
    const indices = originalGeometry.index?.array;
    
    if (!indices || !positionAttribute) return originalGeometry;
    
    const targetTriangles = Math.floor(indices.length / 3 * reductionFactor);
    const newIndices = new Uint16Array(targetTriangles * 3);
    
    // Simple every-nth triangle selection (not optimal, but demonstrates concept)
    const step = Math.floor(indices.length / 3 / targetTriangles);
    
    for (let i = 0; i < targetTriangles; i++) {
      const sourceIndex = i * step * 3;
      newIndices[i * 3] = indices[sourceIndex] || 0;
      newIndices[i * 3 + 1] = indices[sourceIndex + 1] || 0;
      newIndices[i * 3 + 2] = indices[sourceIndex + 2] || 0;
    }
    
    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', positionAttribute);
    newGeometry.setIndex(new THREE.BufferAttribute(newIndices, 1));
    newGeometry.computeVertexNormals();
    newGeometry.computeBoundingSphere();
    
    return newGeometry;
  }
}

// Render Optimization Manager
export class RenderOptimizer {
  private renderer: THREE.WebGLRenderer;
  private performanceMonitor: ThreePerformanceMonitor;
  private lodManager: LODManager;
  private frustumCuller: FrustumCuller;
  // Texture optimizer would be initialized here in a full implementation
  
  private qualityLevel: 'low' | 'medium' | 'high' = 'high';
  private adaptiveQuality = true;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.renderer = renderer;
    this.performanceMonitor = new ThreePerformanceMonitor(renderer);
    this.lodManager = new LODManager(camera);
    this.frustumCuller = new FrustumCuller(camera);
    // Texture optimizer initialization would go here
  }

  update(scene: THREE.Scene) {
    this.performanceMonitor.update();
    this.lodManager.update();
    this.frustumCuller.update();
    
    if (this.adaptiveQuality) {
      this.adjustQuality();
    }
    
    // Apply frustum culling
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.visible = this.frustumCuller.isVisible(object);
      }
    });
  }

  private adjustQuality() {
    if (this.performanceMonitor.shouldReduceQuality()) {
      this.reduceQuality();
    } else if (this.performanceMonitor.shouldIncreaseQuality()) {
      this.increaseQuality();
    }
  }

  private reduceQuality() {
    if (this.qualityLevel === 'high') {
      this.qualityLevel = 'medium';
      this.applyQualitySettings();
    } else if (this.qualityLevel === 'medium') {
      this.qualityLevel = 'low';
      this.applyQualitySettings();
    }
  }

  private increaseQuality() {
    if (this.qualityLevel === 'low') {
      this.qualityLevel = 'medium';
      this.applyQualitySettings();
    } else if (this.qualityLevel === 'medium') {
      this.qualityLevel = 'high';
      this.applyQualitySettings();
    }
  }

  private applyQualitySettings() {
    const settings = this.getQualitySettings();
    
    this.renderer.setPixelRatio(settings.pixelRatio);
    this.renderer.shadowMap.enabled = settings.shadows;
    this.renderer.shadowMap.type = settings.shadowType;
    
    // Apply to existing materials
    // This would need to be implemented based on your specific materials
  }

  private getQualitySettings() {
    const basePixelRatio = Math.min(window.devicePixelRatio, 2);
    
    switch (this.qualityLevel) {
      case 'low':
        return {
          pixelRatio: Math.min(basePixelRatio, 1),
          shadows: false,
          shadowType: THREE.BasicShadowMap,
          antialias: false,
          maxLights: 2
        };
      case 'medium':
        return {
          pixelRatio: Math.min(basePixelRatio, 1.5),
          shadows: true,
          shadowType: THREE.PCFShadowMap,
          antialias: false,
          maxLights: 4
        };
      case 'high':
        return {
          pixelRatio: basePixelRatio,
          shadows: true,
          shadowType: THREE.PCFSoftShadowMap,
          antialias: true,
          maxLights: 8
        };
    }
  }

  getPerformanceStats() {
    return {
      ...this.performanceMonitor.getStats(),
      qualityLevel: this.qualityLevel,
      lodObjects: this.lodManager ? 'active' : 'inactive'
    };
  }

  setAdaptiveQuality(enabled: boolean) {
    this.adaptiveQuality = enabled;
  }

  setQualityLevel(level: 'low' | 'medium' | 'high') {
    this.qualityLevel = level;
    this.applyQualitySettings();
  }
}