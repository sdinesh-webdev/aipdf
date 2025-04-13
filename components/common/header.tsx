import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Header() {
    const isLoggedIn = false; // Replace with actual authentication logic
    return (
        <nav className="bg-yellow-50 z-10 mx-4 my-4 rounded-2xl border-2 shadow-[5px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="container flex items-center justify-between gap-8 py-4 lg:px-8 px-4 mx-auto max-w-7xl">
                <div className="flex items-center gap-2">
                    <Link href='/' className="flex items-center gap-2">
                        <FileText className="h-8 w-8 lg:h-10 lg:w-10 text-black hover:rotate-12 transform transition-all duration-200" />
                        <span className="font-extrabold text-lg lg:text-3xl text-black">
                            AI Summary..
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <SignedIn>
                        <NavLink 
                            href="/upload" 
                            className="text-base lg:text-lg font-semibold text-black hover:text-black transition-colors"
                        >
                            Upload a PDF
                        </NavLink>
                        <UserButton 
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10"
                                }
                            }}
                        />
                    </SignedIn>
                    <SignedOut>
                        <NavLink href='/sign-in' className="text-sm lg:text-base text-black">Sign In</NavLink>
                    </SignedOut>
                </div>
            </div>
        </nav>
    );
}