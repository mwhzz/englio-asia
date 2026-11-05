/**
 * The key a recording is stored under: its English text, trimmed, lower case, single spaces. One recording
 * of "Thank you very much." plays wherever that text is spoken, in any lesson, story or language's course.
 * Shared by the server (server/adminAudio.ts) and the app (lib/media.ts), so both find the same recording.
 */
export const audioKey = (text: string) => text.trim().toLowerCase().replace(/\s+/g, ' ');
