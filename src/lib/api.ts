const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
interface PollResults {
  HAPPY: number;
  NEUTRAL: number;
  SAD: number;
}

interface Poll {
  id: string;
  question: string;
  qrCode?: string;
  results: PollResults;
  createdAt: string;
  userId: string;
}

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
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);
  headers.append("Authorization", `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error("API call failed");
  }
  return response.json();
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  console.log("Login response status:", response.status);
  const data = await response.json();
  console.log("Login response data:", data);
  if (!response.ok) {
    throw new Error(data.error || data.message || "Login failed");
  }
  return data;
}

export async function registerUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
}

export async function createPoll(question: string) {
  return fetchWithAuth(`${API_BASE_URL}/poll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
}

export async function getAllPolls() {
  return fetchWithAuth(`${API_BASE_URL}/polls`);
}

export async function getUserPolls() {
  return fetchWithAuth(`${API_BASE_URL}/user/polls`);
}

export async function getPoll(pollId: string) {
  console.log(`Fetching poll with ID: ${pollId}`);
  console.log(`API URL: ${API_BASE_URL}/poll/${pollId}`);
  try {
    const response = await fetch(`${API_BASE_URL}/poll/${pollId}`);
    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch poll");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching poll:", error);
    throw error;
  }
}

export async function deletePoll(pollId: string) {
  return fetchWithAuth(`${API_BASE_URL}/poll/${pollId}`, {
    method: "DELETE",
  });
}

export async function votePoll(pollId: string, emoji: string): Promise<Poll> {
  try {
    const response = await fetch(`${API_BASE_URL}/poll/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Voting failed");
    }
    return response.json();
  } catch (error) {
    console.error("Error voting:", error);
    throw error;
  }
}

export async function getQRCode(pollId: string) {
  return fetchWithAuth(`${API_BASE_URL}/poll/${pollId}/qr`);
}

export async function getUserAnalytics(): Promise<Analytics> {
  return fetchWithAuth(`${API_BASE_URL}/analytics/user`);
}
