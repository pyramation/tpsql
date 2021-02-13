import { dirname, basename } from 'path';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { sync as mkdirp } from 'mkdirp';

export const write = (obj, outdir) => {
  return Object.keys(obj).reduce((m, k) => {
    const {
      info: { deploy, deps },
      replaced
    } = obj[k];
    const mod = deploy.split(' ')[0];
    const modulename = basename(mod) + '.sql';
    const dir = dirname(mod);

    const files = {
      deploy: join(outdir, 'deploy', dir, modulename),
      revert: join(outdir, 'revert', dir, modulename),
      verify: join(outdir, 'verify', dir, modulename)
    };

    let str = `-- Deploy ${mod} to pg
  
${deps.map((dep) => `-- requires: ${dep}`).join('\n')}
  
BEGIN;
  
${replaced}
  
END;
      `;

    mkdirp(dirname(files.deploy));
    writeFileSync(files.deploy, str);

    //

    str = `-- Revert ${mod} from pg
  
BEGIN;
  
END;
      `;

    mkdirp(dirname(files.revert));
    writeFileSync(files.revert, str);

    //

    str = `-- Verify ${mod} on pg
  
BEGIN;
  
END;
      `;

    mkdirp(dirname(files.verify));
    writeFileSync(files.verify, str);

    m[k] = obj[k];
    return m;
  }, {});
};
