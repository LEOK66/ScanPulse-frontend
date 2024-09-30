import { AlertCircle } from "lucide-react";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div
        className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-md w-full"
        role="alert"
      >
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p className="font-bold">Error</p>
        </div>
        <p className="mt-2">{message}</p>
      </div>
    </div>
  );
}
