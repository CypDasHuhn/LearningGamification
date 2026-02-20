import { ArrowLeft, User2 } from "lucide-react";
import { Link } from "react-router";

export function IngameHeader({ siteName }: { siteName: string }) {
  return (
    <div className="bg-blue-500 flex justify-between items-center p-2 shrink-0">
      <div>
        <Link to="/">
          <button className="bg-blue-600 flex items-center gap-2 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            <ArrowLeft /> Back to Game Menu
          </button>
        </Link>
      </div>
      <div>
        <h1 className="text-white">{siteName}</h1>
      </div>
      <div className="bg-blue-600 flex hover:bg-blue-700 items-center gap-2 text-white px-4 py-2 rounded-md">
        Username
        <User2 className="w-5 h-5 mx-2 rounded-full  bg-red-500 text-white" />
      </div>
    </div>
  );
}
