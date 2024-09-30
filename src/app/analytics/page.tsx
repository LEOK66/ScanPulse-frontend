"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserAnalytics } from "@/lib/api";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Analytics {
  totalPolls: number;
  totalVotes: number;
  averageVotesPerPoll: number;
  pollsWithMostVotes: Array<{
    id: string;
    question: string;
    voteCount: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchAnalytics();
    }
  }, [isAuthenticated, router]);

  async function fetchAnalytics() {
    try {
      const data = await getUserAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError("Failed to fetch analytics data");
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {error ? (
            <div>Error: {error}</div>
          ) : !analytics ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Polls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{analytics.totalPolls}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Votes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{analytics.totalVotes}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Average Votes per Poll</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {analytics.averageVotesPerPoll.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Top 5 Polls by Votes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.pollsWithMostVotes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="question" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="voteCount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
