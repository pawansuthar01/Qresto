"use client";

import { useSession, signOut } from "next-auth/react";
import { Lock, LogOut, User, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect } from "react";
import { checkSession } from "@/lib/check-session";

export function Header() {
  const { data: session, status } = useSession();

  const router = useRouter();
  const [profileImage, setProfileImage, removeImage] = useLocalStorage<
    string | null
  >("profileImage", null);
  const [profileName, setProfileName, removeName] = useLocalStorage<
    string | null
  >("profileName", null);

  useEffect(() => {
    try {
      const name = localStorage.getItem("profileName") || null;
      const logo = localStorage.getItem("profileImage") || null;
      const cleanLogo = logo !== null ? JSON.parse(logo) : null;
      const cleanName = name !== null ? JSON.parse(name) : null;
      setProfileName(cleanName ?? session?.user.name ?? null);
      setProfileImage(cleanLogo ?? session?.user.image ?? null);
    } catch {}
  }, [session?.user]);

  useEffect(() => {
    const validate = async () => {
      const valid = await checkSession();
      if (!valid) router.push("/signin");
    };
    validate();
  }, [router]);

  const openPermissionInNewTab = () => {
    if (session?.user?.restaurantId) {
      const url = `/owner/restaurants/${session.user.restaurantId}/permission`;
      window.open(url, "_blank");
    } else {
      console.warn("Restaurant ID not found in session");
    }
  };

  if (status == "loading") return;

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">QResto</h1>
          {session?.user?.role === "ADMIN" && (
            <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
              Admin
            </span>
          )}
          {session?.user?.role === "OWNER" && (
            <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
              Owner
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {profileImage ? (
                  <img
                    src={profileImage || ""}
                    className="border-1 border-gray-400  rounded-lg h-10 w-12"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Role:{" "}
                    {session?.user?.role === "ADMIN"
                      ? "Company Admin"
                      : "Owner Admin"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className=" cursor-pointer"
                onClick={() => {
                  signOut({ callbackUrl: "/signin" }),
                    removeImage(),
                    removeName();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
              {!session?.user.restaurantId ||
                (["ADMIN", "OWNER"].includes(session?.user?.role || "") && (
                  <DropdownMenuItem
                    onClick={() => router.push("/account/profile")}
                    className=" cursor-pointer"
                  >
                    <User2 className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                ))}
              {session?.user.restaurantId && session.user.role == "OWNER" && (
                <DropdownMenuItem
                  onClick={() => openPermissionInNewTab()}
                  className=" cursor-pointer"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  permissions
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
