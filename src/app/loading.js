import LoadingCat from "@/components/loading/LoadingCat";

export default function LoadingRoot() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-white">
      <LoadingCat />
    </div>
  );
}
