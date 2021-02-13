export * from './readdir';
export * from './parse';
export * from './replace';
export * from './write';

import { getAllArgsFn, replace } from './replace';
import { readdir } from './readdir';
import { parseFiles } from './parse';

import { write as _write } from './write';

export const templatize = (deployDir, outputDir, variables) => {
  const files = readdir(deployDir);
  const obj = parseFiles(files);
  const result = replace(obj, variables);
  _write(result, outputDir);
};

export class Templatizer {
  constructor(deployDir) {
    this.deployDir = deployDir;
    this.files = readdir(deployDir);
    this.obj = parseFiles(this.files);
  }
  variables() {
    return getAllArgsFn(this.obj);
  }
  write(outputDir, variables) {
    const result = replace(this.obj, variables);
    _write(result, outputDir);
    return this;
  }
}
