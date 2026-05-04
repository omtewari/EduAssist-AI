import { useState } from "react";
import { useDispatch } from "react-redux";
import { recordFlashcardFlip } from "../redux/slices/progressSlice";

export default function FlashcardFlip({
  question,
  answer,
  documentId,
  cardId,
}) {
  const dispatch = useDispatch();
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    setFlipped((prev) => {
      const next = !prev;
      if (next && documentId && cardId) {
        dispatch(
          recordFlashcardFlip({
            documentId,
            cardId: String(cardId),
          })
        );
      }
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative h-44 w-full text-left rounded-xl [perspective:1000px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div
        className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div className="absolute inset-0 rounded-xl bg-white shadow-md border border-gray-100 p-4 flex items-center justify-center text-center text-gray-800 text-sm font-medium [backface-visibility:hidden]">
          <span className="line-clamp-6">{question}</span>
        </div>
        <div
          className="absolute inset-0 rounded-xl bg-indigo-50 shadow-md border border-indigo-100 p-4 flex items-center justify-center text-center text-indigo-900 text-sm [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <span className="line-clamp-6">{answer}</span>
        </div>
      </div>
      <span className="sr-only">Flip card</span>
    </button>
  );
}
