"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllPolls, deletePoll } from "@/lib/api";
import { QrCode, Trash2, BarChart2, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";

export default function AllPollsPage() {
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchPolls();
    }
  }, [isAuthenticated, router]);

  async function fetchPolls() {
    setIsLoading(true);
    try {
      const fetchedPolls = await getAllPolls();
      setPolls(fetchedPolls);
    } catch (error) {
      console.error("Failed to fetch polls:", error);
      setError("Failed to fetch polls. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeletePoll(pollId: string) {
    try {
      await deletePoll(pollId);
      await fetchPolls();
    } catch (error) {
      console.error("Failed to delete poll:", error);
      setError("Failed to delete poll. Please try again.");
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">All Polls</h2>
            <Button
              onClick={logout} // Use the real logout function
              variant="outline"
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {isLoading ? (
            <p>Loading polls...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid gap-6">
              {polls.map((poll: any) => (
                <Card key={poll.id}>
                  <CardHeader>
                    <CardTitle>{poll.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Created at: {new Date(poll.createdAt).toLocaleString()}
                    </p>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => router.push(`/pollResult/${poll.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeletePoll(poll.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
