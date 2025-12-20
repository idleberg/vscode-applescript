import type { FSWatcher } from 'fs';
import { readFile, stat, watch, writeFile } from 'fs/promises';
import * as vscode from 'vscode';
import { compileScpt, decompileScpt, scptUriToFileUri } from './scpt-util';

/**
 * Virtual FileSystemProvider for binary AppleScript (.scpt) files
 *
 * This provider intercepts file operations on scpt: URIs and handles
 * decompilation on read and compilation on write, allowing users to
 * edit binary .scpt files as text in the native VSCode editor.
 */
export class ScptFileSystemProvider implements vscode.FileSystemProvider {
	private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	private _watchers = new Map<string, FSWatcher>();

	readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

	/**
	 * Watch for changes to the underlying .scpt file
	 */
	watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[] }): vscode.Disposable {
		const fileUri = scptUriToFileUri(uri);
		const filePath = fileUri.fsPath;

		// If already watching, return existing watcher
		if (this._watchers.has(filePath)) {
			return new vscode.Disposable(() => {
				// Don't actually dispose - other watchers might exist
			});
		}

		// Watch the actual file for changes
		const watcher = watch(filePath, async (eventType) => {
			if (eventType === 'change' || eventType === 'rename') {
				this._emitter.fire([
					{
						type: vscode.FileChangeType.Changed,
						uri: uri,
					},
				]);
			}
		});

		this._watchers.set(filePath, watcher as any);

		return new vscode.Disposable(() => {
			const w = this._watchers.get(filePath);
			if (w) {
				w.close();
				this._watchers.delete(filePath);
			}
		});
	}

	/**
	 * Get file metadata from the underlying .scpt file
	 */
	async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
		const fileUri = scptUriToFileUri(uri);
		const filePath = fileUri.fsPath;

		try {
			const stats = await stat(filePath);

			return {
				type: vscode.FileType.File,
				ctime: stats.ctimeMs,
				mtime: stats.mtimeMs,
				size: stats.size, // Note: This is the binary size, not decompiled size
			};
		} catch (error: any) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
	}

	/**
	 * Read and decompile a .scpt file
	 */
	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		const fileUri = scptUriToFileUri(uri);
		const filePath = fileUri.fsPath;

		try {
			// Decompile the binary file
			const sourceCode = await decompileScpt(filePath);

			// Return as UTF-8 bytes
			return Buffer.from(sourceCode, 'utf-8');
		} catch (error: any) {
			// If decompilation fails, try reading as text (might be a plain text file)
			try {
				const buffer = await readFile(filePath);
				return new Uint8Array(buffer);
			} catch {
				throw vscode.FileSystemError.FileNotFound(uri);
			}
		}
	}

	/**
	 * Compile and write a .scpt file
	 */
	async writeFile(
		uri: vscode.Uri,
		content: Uint8Array,
		options: { create: boolean; overwrite: boolean },
	): Promise<void> {
		const fileUri = scptUriToFileUri(uri);
		const filePath = fileUri.fsPath;

		try {
			// Check if file exists
			const exists = await stat(filePath)
				.then(() => true)
				.catch(() => false);

			if (!exists && !options.create) {
				throw vscode.FileSystemError.FileNotFound(uri);
			}

			if (exists && !options.overwrite) {
				throw vscode.FileSystemError.FileExists(uri);
			}

			// Convert content to string
			const sourceCode = Buffer.from(content).toString('utf-8');

			// Compile to binary .scpt
			await compileScpt(sourceCode, filePath);

			// Fire change event
			this._emitter.fire([
				{
					type: exists ? vscode.FileChangeType.Changed : vscode.FileChangeType.Created,
					uri: uri,
				},
			]);
		} catch (error: any) {
			if (error instanceof vscode.FileSystemError) {
				throw error;
			}
			throw vscode.FileSystemError.Unavailable(`Failed to write ${uri.fsPath}: ${error.message}`);
		}
	}

	/**
	 * Rename operation (move the underlying .scpt file)
	 */
	async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): Promise<void> {
		const oldFileUri = scptUriToFileUri(oldUri);
		const newFileUri = scptUriToFileUri(newUri);

		try {
			const fs = require('fs').promises;
			await fs.rename(oldFileUri.fsPath, newFileUri.fsPath);

			this._emitter.fire([
				{ type: vscode.FileChangeType.Deleted, uri: oldUri },
				{ type: vscode.FileChangeType.Created, uri: newUri },
			]);
		} catch (error: any) {
			throw vscode.FileSystemError.Unavailable(`Failed to rename: ${error.message}`);
		}
	}

	/**
	 * Delete the underlying .scpt file
	 */
	async delete(uri: vscode.Uri, options: { recursive: boolean }): Promise<void> {
		const fileUri = scptUriToFileUri(uri);

		try {
			const fs = require('fs').promises;
			await fs.unlink(fileUri.fsPath);

			this._emitter.fire([
				{
					type: vscode.FileChangeType.Deleted,
					uri: uri,
				},
			]);
		} catch (error: any) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
	}

	/**
	 * Create directory (not supported for .scpt files)
	 */
	async createDirectory(uri: vscode.Uri): Promise<void> {
		throw vscode.FileSystemError.NoPermissions('Cannot create directory in scpt: filesystem');
	}

	/**
	 * Read directory (not supported for .scpt files)
	 */
	async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
		throw vscode.FileSystemError.FileNotADirectory(uri);
	}

	/**
	 * Dispose of all watchers
	 */
	dispose(): void {
		for (const watcher of this._watchers.values()) {
			watcher.close();
		}
		this._watchers.clear();
		this._emitter.dispose();
	}
}
