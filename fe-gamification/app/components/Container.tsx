export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="container flex justify-center mx-auto px-4">{children}</div>
  );
}
