import { Link } from "react-router";

export function GameMenu({ onStartClick }: { onStartClick: () => void }) {
  return (
    <div className="flex-1 flex justify-center items-center px-4">
      <div className="flex flex-col bg-emerald-700 items-center justify-center gap-4 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-center items-center bg-red-500 px-4 py-2 rounded">
          <h1 className="text-white">Lern Spiel Titel</h1>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={onStartClick}
            className="bg-amber-600 text-white px-4 py-2 rounded-md w-full hover:bg-amber-700"
          >
            Start
          </button>
          <Link to="/scoreboard">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600"
            >
              Scoreboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
