export function formatCallDuration(startedAt: Date, endedAt: Date): string {
  const seconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
