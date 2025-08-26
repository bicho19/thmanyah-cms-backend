import {fileURLToPath} from 'url';
import path from 'path';

export const getCurrentDirName = (url :string): string => {
  const __filename = fileURLToPath(url);
  return path.dirname(__filename);
}
