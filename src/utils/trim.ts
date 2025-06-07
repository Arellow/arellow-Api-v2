
export function trimObjectKeys(obj :any) {
  Object.keys(obj).forEach((key) => {
    const trimmedKey = key.trim();
    if (trimmedKey !== key) {
      obj[trimmedKey] = obj[key];
      delete obj[key];
    }
  });
}
