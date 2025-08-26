import {toCamelCase} from '@utils/to-camel-case';
import {upperCaseFirst} from '@utils/upper-case-first';
import {parse} from 'node:path';

/**
 * Formats a filename into the correct container resolution name.
 * Names are camelCase formatted and namespaced by the folder i.e:
 * models/example-person -> examplePersonModel
 * @param {string} path - the full path of the file
 * @return {string} the formatted name
 */
export function formatRegistrationName(path: string): string {
  const parsed = parse(path);
  const parsedDir = parse(parsed.dir);
  let directoryNamespace = parsedDir.name;

  if (directoryNamespace.startsWith('__')) {
    const parsedCoreDir = parse(parsedDir.dir);
    directoryNamespace = parsedCoreDir.name;
  }

  switch (directoryNamespace) {
    // We strip the last character when adding the type of registration
    // this is a trick for plural "ies"
    case 'repositories':
      directoryNamespace = 'repository';
      break;
    case 'entities':
      directoryNamespace = 'entity';
      break;
    default:
      break;
  }
  return formatRegistrationNameWithoutNamespace(path);
}

export function formatRegistrationNameWithoutNamespace(path: string): string {
  const parsed = parse(path);

  return toCamelCase(parsed.name);
}

export default formatRegistrationName;
