"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPoll, deletePoll } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Label,
  PieLabelRenderProps,
} from "recharts";
import { QRCodeSVG } from "qrcode.react";
import { Download, Trash2, RefreshCw, QrCode } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PollResults {
  HAPPY: number;
  NEUTRAL: number;
  SAD: number;
}

interface Poll {
  id: string;
  question: string;
  results: PollResults;
}

export default function PollDetailsPage({
  params,
}: {
  params: { pollId: string };
}) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const qrCodeUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/vote/${params.pollId}`;

  useEffect(() => {
    fetchPollDetails();
  }, [params.pollId, fetchPollDetails]);

  async function fetchPollDetails() {
    try {
      setIsLoading(true);
      const pollData = await getPoll(params.pollId);
      setPoll(pollData);
    } catch (error) {
      console.error("Error fetching poll details:", error);
      setError("Failed to fetch poll details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeletePoll() {
    if (window.confirm("Are you sure you want to delete this poll?")) {
      try {
        await deletePoll(params.pollId);
        router.push("/dashboard");
      } catch (error) {
        setError("Failed to delete poll. Please try again.");
      }
    }
  }

  function handleDownloadQRCode() {
    const svg = document.getElementById("qr-code");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = `qr-code-${params.pollId}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!poll) return null;

  const data = [
    { name: "😊", value: poll.results.HAPPY || 0, color: "#10B981" },
    { name: "😐", value: poll.results.NEUTRAL || 0, color: "#F59E0B" },
    { name: "😢", value: poll.results.SAD || 0, color: "#EF4444" },
  ];

  const totalVotes = data.reduce((sum, item) => sum + item.value, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (data[index].value > 0) {
      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          className="text-sm font-medium"
        >
          {`${data[index].name} ${(percent * 100).toFixed(0)}%`}
        </text>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
      <Card className="shadow-xl w-full max-w-4xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="h-10 w-10 mr-3" />
            <CardTitle className="text-3xl md:text-4xl font-bold">
              ScanPulse
            </CardTitle>
          </div>
          <CardTitle className="text-xl md:text-2xl text-center mt-2">
            {poll.question}
          </CardTitle>
          <CardDescription className="text-center text-primary-foreground/90 text-lg mt-2">
            Total Votes: {totalVotes}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={renderCustomizedLabel}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-center">
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <QRCodeSVG id="qr-code" value={qrCodeUrl} size={200} />
                <Button
                  onClick={handleDownloadQRCode}
                  className="mt-6 w-full md:w-auto"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" /> Download QR Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={fetchPollDetails}
            className="bg-white hover:bg-gray-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
