import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackPageview } from "@/lib/analytics";

export function AnalyticsTracker() {
 const pathname = usePathname();
 const searchParams = useSearchParams();

 useEffect(() => {
 trackPageview(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
 }, [pathname, searchParams]);

 return null;
}
