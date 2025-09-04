import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Roboto_Mono } from 'next/font/google';

const cascadia = Roboto_Mono({ subsets: ['latin'], weight: ['400', '700'] });

export default function Header() {
    // Professional header: logo at far left, nav in center, login/signin at far right
    return (
        <nav className="w-full  bg-lime-400  fixed top-0 left-0 right-0 z-50">
            <div className="max-w-full mx-auto px-4">
                <div className="flex items-center h-16 justify-between">
                    {/* Logo Section - Start */}
                    <div className="flex items-center gap-2 px-6 py-2 border-r-2 border-gray-600 h-full">
                        <Link href="/" className="flex items-center gap-2 group">
                            <FileText className="h-8 w-8 " />
                            <span className={`text-gray-900 font-bold text-xl ${cascadia.className}`}>AI - Based Summary</span>
                        </Link>
                    </div>


                    {/* Login/SignIn Section - End */}
                    <div className="flex items-center px-6 border-l-2 border-gray-600 h-full min-w-[180px] justify-end">
                        <SignedIn>
                            <div className="flex items-center">
                                <NavLink 
                                    href="/upload" 
                                    className="inline-flex items-center px-2 py-2 text-base font-semibold rounded-md  text-gray-700 hover:bg-gray-100"
                                >
                                    Upload a PDF
                                </NavLink>
                                <div className="ml-2">
                                    <UserButton 
                                        afterSignOutUrl="/"
                                        appearance={{
                                            elements: {
                                                avatarBox: "w-8 h-8 mt-2 border-2 border-gray-200 shadow-sm"
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </SignedIn>
                        <SignedOut>
               <NavLink
  href="/sign-in"
  className="inline-flex items-center whitespace-nowrap px-4 py-2 
             text-lg font-bold text-gray-700 
            
             hover:bg-gray-100 
             transition-colors duration-200 rounded-md"
>
  Sign In
</NavLink>


                        </SignedOut>
                    </div>
                </div>
            </div>
        </nav>
    );
}