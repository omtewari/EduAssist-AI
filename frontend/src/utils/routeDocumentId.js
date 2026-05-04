/** Match Mongo-style ObjectId in document / flashcards / topics routes */
export function parseDocumentIdFromPath(pathname) {
  const m = pathname.match(
    /\/(?:document|flashcards|topics)\/([a-f\d]{24})/i
  );
  return m?.[1] || null;
}
