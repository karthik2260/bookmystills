import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white flex-col gap-6">
      {/* Spinner */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900"
          style={{ animation: "spin 0.75s linear infinite" }}
        />
      </div>

      {/* Brand */}
      <p className="text-sm font-medium text-gray-400 tracking-widest uppercase">
        bookmystills
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
