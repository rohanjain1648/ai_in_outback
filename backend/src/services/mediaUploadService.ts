// @ts-nocheck
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { IMediaItem } from '../models/CulturalStory';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

export interface ProcessedMediaItem extends IMediaItem {
  thumbnailUrl?: string;
  processedUrl?: string;
}

export class MediaUploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');
  private maxFileSize = 50 * 1024 * 1024; // 50MB
  
  private allowedMimeTypes = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };
  
  constructor() {
    this.ensureUploadDirectories();
  }
  
  private async ensureUploadDirectories(): Promise<void> {
    const directories = [
      this.uploadDir,
      path.join(this.uploadDir, 'images'),
      path.join(this.uploadDir, 'videos'),
      path.join(this.uploadDir, 'audio'),
      path.join(this.uploadDir, 'documents'),
      path.join(this.uploadDir, 'thumbnails')
    ];
    
    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }
  
  getMulterConfig(): multer.Multer {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const mediaType = this.getMediaType(file.mimetype);
        const subDir = mediaType === 'image' ? 'images' : 
                      mediaType === 'video' ? 'videos' :
                      mediaType === 'audio' ? 'audio' : 'documents';
        cb(null, path.join(this.uploadDir, subDir));
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });
    
    return multer({
      storage,
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Maximum 10 files per upload
      },
      fileFilter: (req, file, cb) => {
        const mediaType = this.getMediaType(file.mimetype);
        const allowedTypes = this.allowedMimeTypes[mediaType as keyof typeof this.allowedMimeTypes];
        
        if (allowedTypes && allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} is not allowed`));
        }
      }
    });
  }
  
  async processUploadedFiles(files: UploadedFile[], captions?: string[]): Promise<ProcessedMediaItem[]> {
    const processedFiles: ProcessedMediaItem[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mediaType = this.getMediaType(file.mimetype);
      
      try {
        const processedItem = await this.processFile(file, mediaType);
        processedItem.caption = captions?.[i] || '';
        processedFiles.push(processedItem);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Clean up the uploaded file if processing fails
        await this.deleteFile(file.path);
        throw new Error(`Failed to process file: ${file.originalname}`);
      }
    }
    
    return processedFiles;
  }
  
  private async processFile(file: UploadedFile, mediaType: string): Promise<ProcessedMediaItem> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const relativePath = path.relative(process.cwd(), file.path);
    const url = `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
    
    const mediaItem: ProcessedMediaItem = {
      type: mediaType as 'image' | 'video' | 'audio' | 'document',
      url,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      metadata: {}
    };
    
    switch (mediaType) {
      case 'image':
        await this.processImage(file, mediaItem);
        break;
      case 'video':
        await this.processVideo(file, mediaItem);
        break;
      case 'audio':
        await this.processAudio(file, mediaItem);
        break;
      case 'document':
        await this.processDocument(file, mediaItem);
        break;
    }
    
    return mediaItem;
  }
  
  private async processImage(file: UploadedFile, mediaItem: ProcessedMediaItem): Promise<void> {
    try {
      const image = sharp(file.path);
      const metadata = await image.metadata();
      
      mediaItem.metadata = {
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0
        },
        format: metadata.format,
        hasAlpha: metadata.hasAlpha
      };
      
      // Generate thumbnail
      const thumbnailPath = path.join(
        this.uploadDir,
        'thumbnails',
        `thumb_${path.basename(file.filename, path.extname(file.filename))}.webp`
      );
      
      await image
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);
      
      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      const relativeThumbnailPath = path.relative(process.cwd(), thumbnailPath);
      mediaItem.thumbnailUrl = `${baseUrl}/${relativeThumbnailPath.replace(/\\/g, '/')}`;
      
      // Optimize original image if it's large
      if (file.size > 2 * 1024 * 1024) { // 2MB
        const optimizedPath = path.join(
          path.dirname(file.path),
          `opt_${path.basename(file.filename)}`
        );
        
        await image
          .jpeg({ quality: 85, progressive: true })
          .toFile(optimizedPath);
        
        // Replace original with optimized version
        await fs.unlink(file.path);
        await fs.rename(optimizedPath, file.path);
        
        const newStats = await fs.stat(file.path);
        mediaItem.size = newStats.size;
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
  
  private async processVideo(file: UploadedFile, mediaItem: ProcessedMediaItem): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(file.path, async (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const duration = metadata.format.duration || 0;
        
        mediaItem.metadata = {
          duration: Math.round(duration),
          dimensions: {
            width: videoStream?.width || 0,
            height: videoStream?.height || 0
          },
          bitrate: metadata.format.bit_rate,
          codec: videoStream?.codec_name
        };
        
        // Generate thumbnail from video
        const thumbnailPath = path.join(
          this.uploadDir,
          'thumbnails',
          `thumb_${path.basename(file.filename, path.extname(file.filename))}.jpg`
        );
        
        ffmpeg(file.path)
          .screenshots({
            timestamps: ['10%'],
            filename: path.basename(thumbnailPath),
            folder: path.dirname(thumbnailPath),
            size: '300x300'
          })
          .on('end', async () => {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
            const relativeThumbnailPath = path.relative(process.cwd(), thumbnailPath);
            mediaItem.thumbnailUrl = `${baseUrl}/${relativeThumbnailPath.replace(/\\/g, '/')}`;
            resolve();
          })
          .on('error', (error) => {
            console.error('Error generating video thumbnail:', error);
            resolve(); // Continue without thumbnail
          });
      });
    });
  }
  
  private async processAudio(file: UploadedFile, mediaItem: ProcessedMediaItem): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(file.path, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        const duration = metadata.format.duration || 0;
        
        mediaItem.metadata = {
          duration: Math.round(duration),
          bitrate: metadata.format.bit_rate,
          codec: audioStream?.codec_name,
          sampleRate: audioStream?.sample_rate,
          channels: audioStream?.channels
        };
        
        resolve();
      });
    });
  }
  
  private async processDocument(file: UploadedFile, mediaItem: ProcessedMediaItem): Promise<void> {
    // For documents, we mainly store basic metadata
    mediaItem.metadata = {
      extension: path.extname(file.originalname).toLowerCase(),
      encoding: file.encoding
    };
    
    // Could add PDF page count, word count, etc. here in the future
  }
  
  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }
  
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  
  async deleteMediaItems(mediaItems: IMediaItem[]): Promise<void> {
    for (const item of mediaItems) {
      try {
        // Delete main file
        const mainPath = this.urlToPath(item.url);
        await this.deleteFile(mainPath);
        
        // Delete thumbnail if exists
        if ('thumbnailUrl' in item && item.thumbnailUrl) {
          const thumbnailPath = this.urlToPath(item.thumbnailUrl);
          await this.deleteFile(thumbnailPath);
        }
      } catch (error) {
        console.error(`Error deleting media item ${item.filename}:`, error);
      }
    }
  }
  
  private urlToPath(url: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const relativePath = url.replace(baseUrl + '/', '');
    return path.join(process.cwd(), relativePath.replace(/\//g, path.sep));
  }
  
  validateFileUpload(file: UploadedFile): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`
      };
    }
    
    // Check mime type
    const mediaType = this.getMediaType(file.mimetype);
    const allowedTypes = this.allowedMimeTypes[mediaType as keyof typeof this.allowedMimeTypes];
    
    if (!allowedTypes || !allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} is not allowed`
      };
    }
    
    return { isValid: true };
  }
}

export const mediaUploadService = new MediaUploadService();
