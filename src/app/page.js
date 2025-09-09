"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [updateStatus, setUpdateStatus] = useState("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onUpdateMessage((data) => {
        if (data.status === "progress") {
          setProgress(Math.round(data.progress.percent));
          setUpdateStatus("progress");
        } else {
          setUpdateStatus(data.status);
        }
      });
    }
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center border bg-gray-100  font-sans">
      <h1 className="text-3xl font-bold mb-6"> My Electron App</h1>

      {updateStatus === "idle" && (
        <p className="text-gray-600">App is running, waiting for updates...</p>
      )}

      {updateStatus === "checking" && (
        <p className="text-blue-500">🔎 Checking for updates...</p>
      )}

      {updateStatus === "available" && (
        <div className="bg-blue-800 px-6 py-4 rounded-2xl shadow-lg">
          <p className="font-semibold">✅ Update available!</p>
          <p className="text-sm text-gray-300">Downloading will start soon...</p>
        </div>
      )}

      {updateStatus === "progress" && (
        <div className="w-64 mt-4">
          <p className="mb-2 text-sm">⬇️ Downloading update: {progress}%</p>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {updateStatus === "downloaded" && (
        <div className="mt-6 bg-green-800 px-6 py-4 rounded-2xl shadow-lg flex flex-col items-center gap-3">
          <p className="font-semibold">🎉 Update Ready!</p>
          <p className="text-sm text-gray-300">Click below to restart & install</p>
          <button
            onClick={() => window.electronAPI.installUpdate()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-md"
          >
            🔄 Restart & Install
          </button>
        </div>
      )}

      {updateStatus === "no-update" && (
        <p className="text-green-400">✔️ You are on the latest version</p>
      )}

      {updateStatus === "error" && (
        <p className="text-red-400">❌ Failed to update. Please try later.</p>
      )}
    </div>
  );
}
