import { NextResponse, type NextRequest } from "next/server";
import { AdminApiError, AdminSessionEnded, downloadUpload } from "@/lib/admin/api";
import { isAdminPath } from "@/lib/admin/dal";
import { readAdminSession } from "@/lib/admin/session";

/**
 * A customer's uploaded model, for the print floor.
 *
 * Streamed through this server because the browser holds no token to fetch
 * it from the API itself — the admin token lives only in the httpOnly cookie
 * this handler reads. Nothing is buffered here; the file passes straight
 * through.
 */
export async function GET(request: NextRequest, context: RouteContext<"/[admin]/uploads/[id]">) {
  const { admin, id } = await context.params;

  // The same answer as any other address that is not a page.
  if (!isAdminPath(admin)) return new NextResponse(null, { status: 404 });

  const login = new URL(`/${admin}/login?expired=1`, request.url);
  const session = await readAdminSession();
  if (!session) return NextResponse.redirect(login);

  try {
    const upstream = await downloadUpload(session.token, id);

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": upstream.headers.get("content-disposition") ?? "attachment",
        "Cache-Control": "no-store, private",
      },
    });
  } catch (cause) {
    if (cause instanceof AdminSessionEnded) return NextResponse.redirect(login);
    if (cause instanceof AdminApiError) {
      return new NextResponse(cause.message, { status: cause.status === 404 ? 404 : 502 });
    }
    throw cause;
  }
}
