export function Header({
  isLoggedIn,
  onLoginClick,
  onLogoutClick,
}: {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}) {
  return (
    <div className="bg-blue-500 flex justify-end items-center p-2 shrink-0">
      {!isLoggedIn ? (
        <button
          type="button"
          onClick={onLoginClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Login
        </button>
      ) : (
        <button
          type="button"
          onClick={onLogoutClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Logout
        </button>
      )}
    </div>
  );
}
