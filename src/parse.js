import fs from 'fs';
import path from 'path';

export const parse = ({ lines, fnName }) => {
  const replaces = [];
  const commentExp = /^\s*--/;
  const replaceRegExp = /^\s*--\sreplace:\s(.*)\s(.*)\s(.*)$/;
  const requireRegExp = /^\s*--\srequires:\s(.*)$/;
  const deployRegExp = /^\s*--\sDeploy\s(.*)$/;
  const revertRegExp = /^\s*--\sRevert\s(.*)$/;
  const verifyRegExp = /^\s*--\sVerify\s(.*)$/;
  const hintRegexp = /^\s*--\shint:\s(.*)$/;
  const revertExp = /^\s*--\srevert:/;
  const verifyExp = /^\s*--\sverify:/;

  const deps = [];
  let deploys = [];
  let type;
  let mode = 'deploy';
  const reverts = [];
  const verifys = [];
  lines = lines
    .map((line, l) => {
      if (replaceRegExp.test(lines[l])) {
        const [m, find, replace, type] = line.match(replaceRegExp);
        replaces.push({ find, replace, type });
        return '';
      } else if (hintRegexp.test(line)) {
        const [m, type] = line.match(hintRegexp);
        return '';
      } else if (requireRegExp.test(line)) {
        const [m, stuff] = line.match(requireRegExp);
        deps.push(stuff.trim().split(' '));
        return '';
      } else if (deployRegExp.test(line)) {
        const [m, stuff] = line.match(deployRegExp);
        deploys = stuff.trim();
        type = 'Deploy';
        return '';
      } else if (revertRegExp.test(line)) {
        const [m, stuff] = line.match(revertRegExp);
        deploys = stuff.trim();
        type = 'Revert';
        return '';
      } else if (verifyRegExp.test(line)) {
        const [m, stuff] = line.match(verifyRegExp);
        type = 'Verify';
        deploys = stuff.trim();
        return '';
      } else if (revertExp.test(line)) {
        mode = 'revert';
        return '';
      } else if (verifyExp.test(line)) {
        mode = 'verify';
        return '';
        // commentExp MUST go LAST for new comment helpers
      } else if (commentExp.test(line)) {
        return '';
      }

      if (mode == 'revert') {
        reverts.push(line);
      } else if (mode === 'verify') {
        verifys.push(line);
      } else return line;
      return '';
    })
    .filter((el) => el !== '');

  if (!lines.length) {
    return;
  }

  if (lines[0].trim() === 'BEGIN;') {
    lines.shift();
  }
  if (lines[lines.length - 1].trim() === 'COMMIT;') {
    lines.pop();
  }

  const args = replaces.map(({ replace }) => replace);
  const orderedReplaces = replaces
    .map((a) => a)
    .sort(function (a, b) {
      // ASC  -> a.length - b.length
      // DESC -> b.length - a.length
      return b.find.length - a.find.length;
    });

  const orderOfArgs = replaces.reduce((m, v, i) => {
    m[v.find] = i;
    return m;
  }, {});

  deps.forEach((dep) => {
    const [m, ...rest] = dep;
    rest.forEach((el) => {
      if (!args.includes(el)) {
        if (el.match(/^'[^']+'$/)) {
          // console.log('Found a STRING '+el);
        } else {
          console.error({ el });
          console.error({ args });
          console.error(`bad dep ${el} in ${fnName}`);
          process.exit(1);
        }
      }
    });
  });

  return {
    lines,
    deploys,
    verifys,
    reverts,
    orderedReplaces,
    replaces,
    deps,
    type
  };
};

export const parseFile = (sqlfile) => {
  const fnName = path.basename(sqlfile).replace(path.extname(sqlfile), '');
  const lines = fs.readFileSync(sqlfile).toString().split('\n');
  return parse({ lines, fnName });
};

export const parseFiles = (files) => {
  return files.reduce((m, file) => {
    m[file] = parseFile(file);
    return m;
  }, {});
};
