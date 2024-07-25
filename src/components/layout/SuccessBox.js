export default function SuccessBox({ children }) {
  return (
    <h2 className="p-4 text-center bg-green-100 border border-green-300 rounded-lg">
      {children}
    </h2>
  );
}
