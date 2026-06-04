/**
 * Google Drive integration — server-side only (service account).
 *
 * Why: Jackie deliverables, signed agreements, and intel packets live in Drive.
 * Camelot OS needs to write reports into the right client folder and read
 * intern uploads. We use a service account (not user OAuth) so the workflow
 * runs unattended overnight.
 *
 * Setup (one-time, in Google Cloud Console):
 *   1. Create project `camelot-os`
 *   2. Enable the Drive API
 *   3. Create a service account `camelot-os-bot@…iam.gserviceaccount.com`
 *   4. Generate a JSON key, paste into GOOGLE_SERVICE_ACCOUNT_JSON env var
 *   5. Share your target Drive folders with the bot's email (Editor)
 *
 * The token exchange + signed JWT logic runs in the Edge Function
 * (`google-drive-sync`) so the JSON key never touches the browser.
 */

export interface DriveUploadInput {
  /** Folder id to drop the file under. */
  parentFolderId: string;
  /** What to call the file in Drive. */
  name: string;
  /** Content. */
  bytes: Uint8Array;
  mimeType: string;
}

export interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  mimeType: string;
}

/**
 * Client-callable shape — actual fetch happens server-side in the Edge
 * Function. The browser just POSTs the metadata + uses signed upload URLs.
 * This module exists so the frontend has a typed contract.
 */
export interface DriveClient {
  uploadFile: (input: DriveUploadInput) => Promise<DriveFile>;
  listFolder: (folderId: string) => Promise<DriveFile[]>;
  ensureFolder: (parentId: string, name: string) => Promise<DriveFile>;
}

/**
 * No-op client used in demo mode when the Edge Function isn't deployed yet.
 * Lets the UI render the "Save to Drive" affordance without crashing.
 */
export function makeNoopDriveClient(): DriveClient {
  return {
    async uploadFile() {
      throw new Error('Google Drive disabled — deploy the google-drive-sync Edge Function first');
    },
    async listFolder() {
      return [];
    },
    async ensureFolder() {
      throw new Error('Google Drive disabled');
    },
  };
}
