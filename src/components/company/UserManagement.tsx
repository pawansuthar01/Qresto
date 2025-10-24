"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, User, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import CreateRestaurantDialog from "./CreateRestaurantDialog";
import { ConfirmWithReason } from "../ui/confirmDialog";
import { useUpdateUser } from "@/hooks/useActiveUsers";
import { useSession } from "next-auth/react";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
  restaurantId?: string;
}

export function UserManagement() {
  const { data: AdminUser } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: "",
    confirmMessage: "",
    data: { id: "", status: "" },
  });
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [registerEmail, setRegisterEmail] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [usersData, setUsersData] = useState<any[]>([]);
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
  useEffect(() => {
    setUsersData(users);
  }, [users, isLoading]);

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const handelUpdateUser = async (reason: string) => {
    if (!confirmDialog.data?.id || !confirmDialog.data?.status || !reason)
      return;
    const data = {
      status: confirmDialog.data.status,
      reason: reason,
      suspendedAt:
        confirmDialog.data?.status === "suspended" ? new Date() : undefined,
      blockedAt:
        confirmDialog.data?.status === "blocked" ? new Date() : undefined,
    };
    const res = await updateUser.mutateAsync({
      userId: confirmDialog.data.id,
      data,
    });
    console.log(res);
    setUsersData((prev) => {
      const exists = prev.some((u) => u.id === res?.id);
      if (!exists) return [...prev, res];

      return prev.map((u) => (u.id === res?.id ? res : u));
    });
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      role: "SUPER_ADMIN",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage system users and assign them to restaurants
            </CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading users...
            </div>
          ) : usersData?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="grid  md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {usersData?.map((user: any) => (
                <div key={user.id} className=" border rounded-lg p-1 ">
                  <div className="flex items-center justify-between rounded-lg  p-4">
                    <div className="space-y-1">
                      <Badge
                        variant={
                          user.status === "active" ? "outline" : "destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      {user.restaurant && (
                        <p className="text-xs text-muted-foreground">
                          Restaurant: {user.restaurant.name}
                        </p>
                      )}
                      {user.role == "OWNER" && !user.restaurant && (
                        <Button
                          onClick={() => {
                            setCreateDialogOpen(true),
                              setRegisterEmail(user.email);
                          }}
                        >
                          register resto
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {AdminUser?.user.id !== user.id && (
                    <div className="m-1">
                      {user.status == "active" ? (
                        <div className="gap-1 flex">
                          <Button
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                message:
                                  "Suspending this account will temporarily disable access. Are you sure you want to proceed?",
                                confirmMessage: `SUSPEND`,
                                data: {
                                  id: user.id,
                                  status: "suspended",
                                },
                              });
                            }}
                            size={"sm"}
                            variant={"outline"}
                          >
                            suspend
                          </Button>
                          <Button
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                message:
                                  "Blocking this account will permanently prevent the user from logging in",
                                confirmMessage: `BLOCK`,
                                data: {
                                  id: user.id,

                                  status: "blocked",
                                },
                              });
                            }}
                            size={"sm"}
                            variant={"destructive"}
                          >
                            block
                          </Button>
                        </div>
                      ) : (
                        <Button size={"sm"} variant={"secondary"}>
                          active
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-9"
                  placeholder="John Doe"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  placeholder="john@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value: "ADMIN" | "SUPER_ADMIN") =>
                  setValue("role", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">content Manage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmWithReason
        open={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({
            isOpen: false,
            message: "",
            confirmMessage: "",
            data: { id: "", status: "" },
          })
        }
        message={confirmDialog.message}
        onConfirm={(reason) => handelUpdateUser(reason)}
        confirmMessage={confirmDialog.confirmMessage}
      />
      <CreateRestaurantDialog
        onUsers={(owner) => {
          setUsersData((prev) => {
            const exists = prev.some((u) => u.id === owner?.id);
            if (!exists) return [...prev, owner];

            return prev.map((u) => (u.id === owner?.id ? owner : u));
          });
        }}
        open={createDialogOpen}
        onOpenChange={() => {
          setCreateDialogOpen(false), setRegisterEmail(null);
        }}
        registerEmail={registerEmail}
      />
    </div>
  );
}
