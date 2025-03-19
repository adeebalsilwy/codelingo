"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n/client";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  iconSrc: string;
  href: string;
};

export const SidebarItem = ({
  label,
  iconSrc,
  href,
}: Props) => {
  const pathname = usePathname();
  const active = pathname === href;
  const { dir } = useI18n();
  const isRtl = dir === "rtl";

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
