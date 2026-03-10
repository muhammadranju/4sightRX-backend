import fs from 'fs';
import path from 'path';

const unlinkFile = (file: string | undefined | null) => {
  if (!file || file.startsWith('http')) {
    return;
  }
  const filePath = path.join('uploads', file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export default unlinkFile;
