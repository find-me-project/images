import { existsSync, unlinkSync } from 'fs';

export function removeFile (path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}
