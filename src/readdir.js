import { sync as glob } from 'glob';

export const readdir = (dirname = process.cwd()) => {
  return glob(dirname + '/**/*.sql');
};
