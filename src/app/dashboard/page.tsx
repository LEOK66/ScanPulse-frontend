"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPoll, getUserPolls, deletePoll } from "@/lib/api";
import {
  BarChart2,
  Home,
  LogOut,
  QrCode,
  Trash2,
  TrendingUp,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  const [question, setQuestion] = useState("");
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [currentPollId, setCurrentPollId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated === undefined) return;
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchUserPolls();
    }
    setAuthLoading(false);
  }, [isAuthenticated, router]);

  async function fetchUserPolls() {
    try {
      const userPolls = await getUserPolls();
      setPolls(userPolls);
    } catch (error) {
      console.error("Failed to fetch user polls:", error);
      setError("Failed to fetch your polls. Please try again.");
    }
  }

  async function handleCreatePoll(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const newPoll = await createPoll(question);
      setQuestion("");
      await fetchUserPolls();
      // Add this logging
      const qrCodeUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/vote/${newPoll.id}`;
      console.log("New Poll QR Code URL:", qrCodeUrl);
      setCurrentPollId(newPoll.id);
      setQrCodeUrl(qrCodeUrl);
      setIsQRCodeModalOpen(true);
    } catch (error) {
      console.error("Failed to create poll:", error);
      setError("Failed to create poll. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeletePoll(pollId: string) {
    try {
      await deletePoll(pollId);
      await fetchUserPolls();
    } catch (error) {
      console.error("Failed to delete poll:", error);
      setError("Failed to delete poll. Please try again.");
    }
  }

  function handleDownloadQRCode() {
    const svg = document.getElementById("qr-code");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qr-code-${currentPollId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        URL.revokeObjectURL(url); // Clean up the object URL
      };
      img.src = url;
    } else {
      console.error("QR code SVG element not found");
    }
  }

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <Button
              onClick={logout} // Use the real logout function
              variant="outline"
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          <Dialog open={isQRCodeModalOpen} onOpenChange={setIsQRCodeModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Poll Created Successfully!</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center">
                <QRCodeSVG
                  id="qr-code"
                  value={qrCodeUrl}
                  size={300}
                  level="H"
                  includeMargin={true}
                />
                <Button
                  onClick={handleDownloadQRCode}
                  className="flex items-center mt-4"
                >
                  <Download className="mr-2 h-4 w-4" /> Download QR Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Polls
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{polls.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Create Poll Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Poll</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Poll Question</Label>
                  <Input
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your poll question"
                    required
                  />
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Poll"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Polls */}
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Polls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {polls.length > 0 ? (
                  polls.map((poll: any) => (
                    <div
                      key={poll.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-700">
                          {poll.question}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created at:{" "}
                          {new Date(poll.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
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
                          size="sm"
                          onClick={() => handleDeletePoll(poll.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No polls created yet. Create your first poll above!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
