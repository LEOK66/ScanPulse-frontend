import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QrCode } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-center">
            Welcome to ScanPulse
          </CardTitle>
          <CardDescription className="text-center">
            Your go-to platform for QR code-based polling and surveys
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-center text-muted-foreground">
            Create, manage, and analyze polls with ease using our intuitive QR
            code system.
          </p>
          <Link href="/login" passHref>
            <Button className="w-full max-w-xs">Get Started</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
