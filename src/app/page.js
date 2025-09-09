"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [updateStatus, setUpdateStatus] = useState("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onUpdateMessage((data) => {
        console.log("Update event:", data);

        if (data.status === "progress") {
          setProgress(Math.round(data.progress.percent));
        } else {
          setUpdateStatus(data.status);
        }
      });
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>My Electron App</h1>
      <p>Update Status: {updateStatus}</p>
      {updateStatus === "progress" && <p>Downloading: {progress}%</p>}
    </div>
  );
}
