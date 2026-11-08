// userdirs are random alphanumerics (or a short fixed name for the bot accounts). Anything
// else, such as a slash or "..", could escape the folder, so it is never allowed.
const SAFE_USERDIR = /^[A-Za-z0-9_-]+$/;

export const isSafeUserdir = (userdir: string): boolean => SAFE_USERDIR.test(userdir);
