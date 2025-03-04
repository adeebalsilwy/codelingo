"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  iconSrc: string;
  href: string;
  isRtl?: boolean;
};

export const SidebarItem = ({
  label,
  iconSrc,
  href,
  isRtl = false,
}: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Button
      variant={active ? "sidebarOutline"  : "sidebar"}
      className="justify-start h-[52px]"
      asChild
    >
      <Link href={href}>
        <Image
          src={iconSrc}
          alt={label}
          className={cn(
            isRtl ? "ml-5" : "mr-5",
            isRtl ? "flip-x" : ""
          )}
          height={32}
          width={32}
        />
        {label}
      </Link>
    </Button>
  );
};
