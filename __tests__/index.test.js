import { readdir, parseFiles, getAllArgs } from '../src';
import path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import mkdirp from 'mkdirp';
import { replace, write, templatize, getAllArgsFn, Templatizer } from '../src';

const dir = randomBytes(20).toString('hex');

const packagesDir = path.join(tmpdir(), dir);
mkdirp.sync(packagesDir);

// NOTE: only support deploy currently... we do have the types.. but who cares about verify/revert rn.

const fixtures = path.join(__dirname, '/../__fixtures__/achievements/deploy');
const rinse = (path) => path.split('__fixtures__')[1];

it('replace', () => {
  templatize(fixtures, packagesDir, {
    private_schema: 'my-private_schema',
    public_schema: 'the_public_schema'
  });
  const out = readdir(packagesDir);
  // console.log(out);
});

it('replace', () => {
  const files = readdir(fixtures);
  let obj = parseFiles(files);
  obj = getAllArgsFn(obj);

  console.log(obj);
});

it('Templatizer', () => {
  const client = new Templatizer(fixtures);
  expect(client.variables()).toMatchSnapshot();
  client.write(packagesDir, {
    private_schema: 'my-private_schema',
    public_schema: 'the_public_schema'
  });
});
