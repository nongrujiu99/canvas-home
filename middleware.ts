import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const publicPaths = ["/", "/login", "/signup", "/prompts"];
    const isPublicPath = publicPaths.includes(pathname);

    const response = await updateSession(request);

    if (isPublicPath) {
        return response;
    }

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
