import { APP_VERSION_LABEL } from '@/lib/app-version';

/**
 * Tiny build-version chip in the bottom-right corner. Distinguishes prod from
 * local and gives David an at-a-glance answer to "is this the new build?".
 */
export default function VersionStamp() {
  return (
    <div
      className="pointer-events-none fixed bottom-2 right-2 z-40 select-none rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-mono tracking-wide text-slate-500 shadow-sm backdrop-blur"
      title={`Camelot OS ${APP_VERSION_LABEL}`}
    >
      {APP_VERSION_LABEL}
    </div>
  );
}
