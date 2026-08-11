type JsonObject = Record<string, unknown>;

const mergeKeys = [
  'scripts',
  'dependencies',
  'devDependencies',
  'peerDependencies',
] as const;

function sortRecord(value: JsonObject | undefined): JsonObject | undefined {
  if (!value) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function mergePackageJson(
  base: JsonObject,
  overlay: JsonObject,
  projectName: string,
): JsonObject {
  const result: JsonObject = {
    ...base,
    ...overlay,
    name: projectName,
  };

  for (const key of mergeKeys) {
    const baseValue = base[key] as JsonObject | undefined;
    const overlayValue = overlay[key] as JsonObject | undefined;
    const merged = sortRecord({
      ...baseValue,
      ...overlayValue,
    });

    if (merged && Object.keys(merged).length > 0) {
      result[key] = merged;
    } else {
      delete result[key];
    }
  }

  return result;
}
