export function logTruthy(toLog: Record<string, unknown>) {
  console.log(
    Object.entries(toLog)
      .filter(([, value]) => value)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  );
}
