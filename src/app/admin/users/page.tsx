"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
  } | null;
  readingsCount: number;
  ordersCount: number;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/admin/users?page=${page}&limit=10`);
        if (response.ok) {
          const data: UsersResponse = await response.json();
          setUsers(data.users);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [session, status, router, page]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            ← Back to Dashboard
          </Button>
        </div>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Name</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Role</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Subscription</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Readings</th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {user.name || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={user.role === "ADMIN" ? "default" : "outline"}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.subscription ? (
                          <Badge
                            className={
                              user.subscription.status === "ACTIVE"
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }
                          >
                            {user.subscription.plan}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">Free</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {user.readingsCount}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
