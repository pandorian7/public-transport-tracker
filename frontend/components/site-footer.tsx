import Logo from "@/components/logo";
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-white ">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-4">
            <Logo />
            <div className="max-w-md">
              <h3 className="font-serif font-semibold text-lg mb-2">
                NextRide – Your Journey, Simplified
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Real-time updates, accurate routes, and the easiest way to plan
                your daily travel across Sri Lanka.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Facebook className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
            <Instagram className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
            <Youtube className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
            <Linkedin className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          ©2025 All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
