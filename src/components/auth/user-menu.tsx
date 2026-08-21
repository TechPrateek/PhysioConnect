"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/actions/auth/logout";
import { AuthenticatedUser } from "@/lib/auth/session";
import { getRedirectForRole } from "@/lib/permissions";

export function UserMenu({ user }: { user: AuthenticatedUser }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  const dashboardUrl = getRedirectForRole(user.role);

  return (
    <div className="flex items-center gap-3">
      <Link href={dashboardUrl}>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[120px] truncate font-medium">{user.name}</span>
          <Badge
            variant={
              user.role === "ADMIN"
                ? "destructive"
                : user.role === "PHYSIOTHERAPIST"
                ? "info"
                : "default"
            }
            className="text-[9px] px-1.5 py-0"
          >
            {user.role}
          </Badge>
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        title="Sign Out"
        className="h-8 px-2 text-muted-foreground hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
