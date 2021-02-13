export * from './readdir';
export * from './parse';
export * from './replace';
export * from './write';

import { replace } from './replace';
import { readdir } from './readdir';
import { parseFiles } from './parse';

import { write } from './write';

export const templatize = (deployDir, outputDir, variables) => {
  const files = readdir(deployDir);
  const obj = parseFiles(files);
  const result = replace(obj, variables);
  write(result, outputDir);
};
