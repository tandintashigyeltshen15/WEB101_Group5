import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoFeed from "../components/VideoFeed";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Recommended</h1>
          <VideoFeed />
        </main>
      </div>
    </div>
  );
}