import format from 'pg-format';

const createFormatString = ({ lines, replaces, orderedReplaces }) => {
  const orderOfArgs = replaces.reduce((m, v, i) => {
    m[v.find] = i;
    return m;
  }, {});

  const newlines = [];
  for (let l = 0; l < lines.length; l++) {
    let line = lines[l].replace(/%/g, '%%');
    let line2 = lines[l].replace(/%/g, '%%');
    for (let r = 0; r < orderedReplaces.length; r++) {
      const { find, replace, type } = orderedReplaces[r];
      const properIndex = orderOfArgs[find];
      line2 = line2.replace(new RegExp(find, 'g'), replace);
      line = line.replace(new RegExp(find, 'g'), `%${properIndex + 1}$${type}`);
    }
    newlines.push(line);
  }
  return newlines.join('\n');
};

const getDepInfo = ({ deps, orderedReplaces, variables }) => {
  const dps = [];
  for (const d of deps.flat()) {
    const dep = replacer({ string: d, orderedReplaces, variables });
    dps.push(dep);
  }
  return dps;
};

const replacer = ({ string, orderedReplaces, variables }) => {
  let str = string;
  for (const r of orderedReplaces) {
    const { find, replace } = r;
    str = str.replace(find, replace);
  }
  for (const r of orderedReplaces) {
    const { replace } = r;
    str = str.replace(replace, variables[replace]);
  }
  return str;
};

export const getFormat = (obj) => {
  return Object.keys(obj).reduce((m, k) => {
    const { lines, replaces, orderedReplaces } = obj[k];
    obj[k].format = createFormatString({ lines, replaces, orderedReplaces });
    m[k] = obj[k];
    return m;
  }, {});
};

export const getDeps = (obj, variables) => {
  return Object.keys(obj).reduce((m, k) => {
    const { deploys, deps, replaces, orderedReplaces } = obj[k];

    obj[k].info = {
      deploy: replacer({
        string: deploys,
        orderedReplaces,
        variables
      }),
      deps: getDepInfo({ deps, replaces, orderedReplaces, variables })
    };

    m[k] = obj[k];
    return m;
  }, {});
};

export const getArgs = (obj) => {
  return Object.keys(obj).reduce((m, k) => {
    const { deps, replaces, orderedReplaces } = obj[k];
    obj[k].args = replaces.map(({ replace }) => replace);
    m[k] = obj[k];
    return m;
  }, {});
};

const getOrderedArgs = ({ orderedReplaces, variables }) => {
  return orderedReplaces.map(({ replace }) => {
    if (!variables) {
      throw new Error('missing variables');
    }
    if (!variables.hasOwnProperty(replace)) {
      throw new Error('missing ' + replace);
    }
    return variables[replace];
  });
};

export const getReplaced = (obj, variables) => {
  return Object.keys(obj).reduce((m, k) => {
    const { orderedReplaces } = obj[k];

    obj[k].replaced = format(
      obj[k].format,
      ...getOrderedArgs({ orderedReplaces, variables })
    );

    m[k] = obj[k];
    return m;
  }, {});
};

export const replace = (obj, variables) => {
  obj = getFormat(obj);
  obj = getDeps(obj, variables);
  obj = getArgs(obj);
  obj = getReplaced(obj, variables);
  return obj;
};
