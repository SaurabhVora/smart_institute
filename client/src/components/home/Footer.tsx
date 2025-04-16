import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-[#0F172A] border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Industry Link Portal</h3>
            <p className="text-white/70 mb-4">Connecting students, faculty, and industry partners for enhanced educational experiences.</p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-blue-500 transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-blue-500 transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-blue-500 transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-blue-500 transition-colors" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">Home</a></Link></li>
              <li><Link href="/about"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">About Us</a></Link></li>
              <li><Link href="/features"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">Features</a></Link></li>
              <li><Link href="/contact"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">Contact</a></Link></li>
              <li><Link href="/faq"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">FAQ</a></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">For Users</h4>
            <ul className="space-y-2">
              <li><Link href="/login"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">Login</a></Link></li>
              <li><Link href="/register"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">Register</a></Link></li>
              <li><Link href="/dashboard"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">Dashboard</a></Link></li>
              <li><Link href="/resources"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">Resources</a></Link></li>
              <li><Link href="/help"><a className="text-white/70 hover:text-white transition-colors cursor-pointer">Help Center</a></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-white/70">123 University Avenue, Tech Park, Bangalore - 560001</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span className="text-white/70">contact@industrylink.edu</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span className="text-white/70">+91 9876543210</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Industry Link Portal. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy"><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Privacy Policy</a></Link>
            <Link href="/terms"><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Terms of Service</a></Link>
            <Link href="/cookies"><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Cookie Policy</a></Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 