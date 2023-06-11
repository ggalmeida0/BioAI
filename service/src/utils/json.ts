type ExtractJSONResult<T> = {
  jsonObject: T | undefined;
  newStr: string;
};
export function extractJSON<T = object>(str: string): ExtractJSONResult<T> {
  const jsonString = str.substring(str.indexOf('{'), str.lastIndexOf('}') + 1);

  let jsonObject = undefined;
  try {
    jsonObject = JSON.parse(jsonString.replace(/'/g, '"'));
  } catch (e) {
    console.error('No valid JSON object found:', e);
  }

  const newStr = str.replace(jsonString, '<JSON>').trim();

  return { jsonObject, newStr };
}
