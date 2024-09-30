"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPoll, votePoll } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Poll {
  id: string;
  question: string;
  // Add other properties as needed
}

export default function VotePage({ params }: { params: { pollId: string } }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("Frontend URL:", process.env.NEXT_PUBLIC_FRONTEND_URL);
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("Poll ID:", params.pollId);
    fetchPoll();
  }, [params.pollId]);

  async function fetchPoll() {
    try {
      console.log("Fetching poll...");
      const fetchedPoll = await getPoll(params.pollId);
      console.log("Fetched poll:", fetchedPoll);
      setPoll(fetchedPoll);
    } catch (error) {
      console.error("Error fetching poll:", error);
      setError("Failed to fetch poll");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVote(emoji: string) {
    try {
      await votePoll(params.pollId, emoji);
      router.push(`/pollResult/${params.pollId}`);
    } catch (error) {
      console.error("Error voting:", error);
      setError("Failed to submit vote");
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!poll) return <ErrorMessage message="Poll not found" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <QrCode className="h-10 w-10 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">ScanPulse</h1>
        </div>
        <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-2xl sm:text-3xl text-center font-bold">
              {poll.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <p className="text-center text-gray-600 mb-4">
                Select your response:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["😊", "😐", "😢"].map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => handleVote(emoji)}
                    className="text-4xl p-6 h-auto hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                    variant="outline"
                    aria-label={`Vote ${emoji}`}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
