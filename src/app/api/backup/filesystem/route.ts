import { NextRequest, NextResponse } from 'next/server';
import { dataBackupManagementEngine } from '@/lib/data-backup-management-engine';
import { promises as fs } from 'fs';
import path from 'path';

interface FilesystemBackupConfig {
  sourcePaths: string[];
  excludePatterns: string[];
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  maxFileSize: number; // bytes
  followSymlinks: boolean;
}

interface BackupManifest {
  backupId: string;
  timestamp: Date;
  sourcePaths: string[];
  totalFiles: number;
  totalSize: number;
  compressionRatio?: number;
  checksum: string;
  metadata: {
    os: string;
    hostname: string;
    backupUser: string;
    garlawsVersion: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const path = searchParams.get('path');

    switch (action) {
      case 'list_backups':
        const backups = await listFilesystemBackups();
        return NextResponse.json({
          success: true,
          data: backups
        });

      case 'backup_info':
        if (!path) {
          return NextResponse.json(
            { error: 'path parameter required' },
            { status: 400 }
          );
        }
        const info = await getBackupInfo(path);
        return NextResponse.json({
          success: true,
          data: info
        });

      case 'validate_paths':
        const pathsToValidate = searchParams.get('paths')?.split(',') || [];
        const validation = await validateBackupPaths(pathsToValidate);
        return NextResponse.json({
          success: true,
          data: validation
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: list_backups, backup_info, or validate_paths' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching filesystem backup data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filesystem backup data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_backup':
        const config: FilesystemBackupConfig = body.config;
        const backupResult = await createFilesystemBackup(config);
        return NextResponse.json({
          success: true,
          data: backupResult
        });

      case 'restore_backup':
        if (!body.backupPath || !body.restorePath) {
          return NextResponse.json(
            { error: 'backupPath and restorePath are required' },
            { status: 400 }
          );
        }
        const restoreResult = await restoreFilesystemBackup(body.backupPath, body.restorePath);
        return NextResponse.json({
          success: true,
          data: restoreResult
        });

      case 'verify_backup':
        if (!body.backupPath) {
          return NextResponse.json(
            { error: 'backupPath is required' },
            { status: 400 }
          );
        }
        const verification = await verifyFilesystemBackup(body.backupPath);
        return NextResponse.json({
          success: true,
          data: verification
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: create_backup, restore_backup, or verify_backup' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing filesystem backup operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform filesystem backup operation' },
      { status: 500 }
    );
  }
}

// Core backup functions
async function createFilesystemBackup(config: FilesystemBackupConfig): Promise<any> {
  const backupId = `fs-backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const backupDir = path.join(process.env.BACKUP_STORAGE_PATH || '/tmp/backups', 'filesystem');
  const backupPath = path.join(backupDir, `${backupId}.tar.gz`);

  try {
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Build tar command with exclusions
    let tarCommand = `tar -czf "${backupPath}"`;

    if (!config.followSymlinks) {
      tarCommand += ' -h';
    }

    // Add exclusions
    for (const pattern of config.excludePatterns) {
      tarCommand += ` --exclude="${pattern}"`;
    }

    // Add source paths
    for (const sourcePath of config.sourcePaths) {
      tarCommand += ` "${sourcePath}"`;
    }

    // Execute backup command
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const { stdout, stderr } = await execAsync(tarCommand);

    // Generate manifest
    const manifest = await generateBackupManifest(backupId, config.sourcePaths, backupPath);

    // Calculate checksum
    const checksum = await calculateFileChecksum(backupPath);

    return {
      backupId,
      path: backupPath,
      manifest,
      checksum,
      createdAt: new Date(),
      status: 'completed'
    };

  } catch (error) {
    // Cleanup failed backup
    try {
      await fs.unlink(backupPath);
    } catch (cleanupError) {
      console.error('Failed to cleanup failed backup:', cleanupError);
    }
    throw error;
  }
}

async function restoreFilesystemBackup(backupPath: string, restorePath: string): Promise<any> {
  try {
    // Ensure restore directory exists
    await fs.mkdir(restorePath, { recursive: true });

    // Extract backup
    const extractCommand = `tar -xzf "${backupPath}" -C "${restorePath}"`;

    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const { stdout, stderr } = await execAsync(extractCommand);

    // Verify restoration
    const verification = await verifyRestoredFiles(backupPath, restorePath);

    return {
      backupPath,
      restorePath,
      extractedAt: new Date(),
      verification,
      status: 'completed'
    };

  } catch (error) {
    throw new Error(`Filesystem restoration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifyFilesystemBackup(backupPath: string): Promise<any> {
  try {
    // Check if backup file exists and is readable
    const stats = await fs.stat(backupPath);

    // Verify file integrity (basic check)
    const isValidArchive = await verifyTarArchive(backupPath);

    // Check manifest if available
    const manifestPath = backupPath.replace('.tar.gz', '.manifest.json');
    let manifest = null;
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      manifest = JSON.parse(manifestContent);
    } catch (error) {
      console.warn('Manifest file not found or invalid');
    }

    return {
      backupPath,
      fileSize: stats.size,
      modifiedTime: stats.mtime,
      isValidArchive,
      hasManifest: manifest !== null,
      manifest: manifest,
      status: isValidArchive ? 'valid' : 'corrupted'
    };

  } catch (error) {
    return {
      backupPath,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper functions
async function listFilesystemBackups(): Promise<any[]> {
  const backupDir = path.join(process.env.BACKUP_STORAGE_PATH || '/tmp/backups', 'filesystem');

  try {
    const files = await fs.readdir(backupDir);
    const backups = [];

    for (const file of files) {
      if (file.endsWith('.tar.gz')) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);

        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        });
      }
    }

    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error listing filesystem backups:', error);
    return [];
  }
}

async function getBackupInfo(backupPath: string): Promise<any> {
  try {
    const stats = await fs.stat(backupPath);

    // Try to read manifest
    const manifestPath = backupPath.replace('.tar.gz', '.manifest.json');
    let manifest = null;
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      manifest = JSON.parse(manifestContent);
    } catch (error) {
      // Manifest not available
    }

    // List contents (first 20 files)
    const listCommand = `tar -tzf "${backupPath}" | head -20`;
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    let contents = [];
    try {
      const { stdout } = await execAsync(listCommand);
      contents = stdout.split('\n').filter((line: string) => line.trim());
    } catch (error) {
      console.error('Error listing backup contents:', error);
    }

    return {
      path: backupPath,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      manifest,
      contents: contents,
      contentCount: contents.length
    };

  } catch (error) {
    throw new Error(`Failed to get backup info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function validateBackupPaths(paths: string[]): Promise<any> {
  const results = [];

  for (const path of paths) {
    try {
      const stats = await fs.stat(path);
      results.push({
        path,
        exists: true,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        accessible: true
      });
    } catch (error) {
      results.push({
        path,
        exists: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

async function generateBackupManifest(
  backupId: string,
  sourcePaths: string[],
  backupPath: string
): Promise<BackupManifest> {
  // Count files and calculate size
  let totalFiles = 0;
  let totalSize = 0;

  for (const sourcePath of sourcePaths) {
    try {
      const stats = await getPathStats(sourcePath);
      totalFiles += stats.files;
      totalSize += stats.size;
    } catch (error) {
      console.warn(`Failed to get stats for ${sourcePath}:`, error);
    }
  }

  // Calculate checksum
  const checksum = await calculateFileChecksum(backupPath);

  const manifest: BackupManifest = {
    backupId,
    timestamp: new Date(),
    sourcePaths,
    totalFiles,
    totalSize,
    checksum,
    metadata: {
      os: process.platform,
      hostname: require('os').hostname(),
      backupUser: process.env.USER || 'system',
      garlawsVersion: process.env.GARLAWS_VERSION || '1.0.0'
    }
  };

  // Save manifest file
  const manifestPath = backupPath.replace('.tar.gz', '.manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  return manifest;
}

async function getPathStats(targetPath: string): Promise<{ files: number; size: number }> {
  let files = 0;
  let size = 0;

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        files++;
        const stats = await fs.stat(fullPath);
        size += stats.size;
      }
    }
  }

  try {
    const stats = await fs.stat(targetPath);

    if (stats.isDirectory()) {
      await walk(targetPath);
    } else {
      files = 1;
      size = stats.size;
    }
  } catch (error) {
    console.error(`Error getting stats for ${targetPath}:`, error);
  }

  return { files, size };
}

async function calculateFileChecksum(filePath: string): Promise<string> {
  const crypto = require('crypto');
  const fileBuffer = await fs.readFile(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

async function verifyTarArchive(archivePath: string): Promise<boolean> {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Test archive integrity
    await execAsync(`tar -tzf "${archivePath}" > /dev/null`);
    return true;
  } catch (error) {
    return false;
  }
}

async function verifyRestoredFiles(backupPath: string, restorePath: string): Promise<any> {
  try {
    // Compare file counts and sizes
    const backupStats = await getPathStats(backupPath);
    const restoreStats = await getPathStats(restorePath);

    return {
      backupFiles: backupStats.files,
      restoredFiles: restoreStats.files,
      backupSize: backupStats.size,
      restoredSize: restoreStats.size,
      filesMatch: backupStats.files === restoreStats.files,
      sizeMatch: backupStats.size === restoreStats.size
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

// Default backup configuration
export const defaultFilesystemConfig: FilesystemBackupConfig = {
  sourcePaths: [
    './uploads',
    './public/user-content',
    './config',
    './data/user-preferences',
    './logs'
  ],
  excludePatterns: [
    '*.log',
    '*.tmp',
    'node_modules',
    '.git',
    '*.cache',
    'tmp/*'
  ],
  compressionEnabled: true,
  encryptionEnabled: false,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  followSymlinks: false
};