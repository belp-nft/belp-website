"use client";
import Image from "next/image";
import Link from "next/link";
import {
  FaTelegramPlane,
  FaWhatsapp,
  FaInstagram,
  FaTwitter,
  FaFacebookF,
} from "react-icons/fa";

export default function BelpFooter() {
  return (
    <footer className="bg-[#690078] pt-12 pb-6 w-full">
      <div className="footer-container w-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 md:gap-0">
          <div className="flex flex-col sm:flex-row gap-10 md:gap-16 w-full md:w-auto px-5 sm:px-10">
            <div>
              <h4 className="font-bold text-white mb-2 text-lg">About</h4>
              <ul className="text-white/80 space-y-2 text-base">
                <li>
                  <Link href="#">Contact Us</Link>
                </li>
                <li>
                  <Link href="#">Terms Of Service</Link>
                </li>
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
              </ul>
              <div className="hidden md:flex gap-4 mt-5">
                <Link href="#">
                  <FaTelegramPlane className="text-xl text-white/80 hover:text-[#B373FD]" />
                </Link>
                <Link href="#">
                  <FaWhatsapp className="text-xl text-white/80 hover:text-[#B373FD]" />
                </Link>
                <Link href="#">
                  <FaInstagram className="text-xl text-white/80 hover:text-[#B373FD]" />
                </Link>
                <Link href="#">
                  <FaTwitter className="text-xl text-white/80 hover:text-[#B373FD]" />
                </Link>
                <Link href="#">
                  <FaFacebookF className="text-xl text-white/80 hover:text-[#B373FD]" />
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2 text-lg">Help</h4>
              <ul className="text-white/80 space-y-2 text-base">
                <li>
                  <Link href="#">Customer Support</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2 text-lg">Developer</h4>
              <ul className="text-white/80 space-y-2 text-base">
                <li>
                  <Link href="#">Github</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center md:items-end mt-8 md:mt-0 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Image
                src="/belp-logo.svg"
                alt="belp"
                width={87}
                height={36}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
        <hr className="border-t border-white/20 my-10 hidden md:block" />
        <div className="text-white/40 text-sm text-center hidden md:block">
          © {new Date().getFullYear()} belp. All rights reserved.
        </div>

        <div className="md:hidden flex gap-4 mt-5 pb-10 px-5 sm:px-10">
          <Link href="#">
            <FaTelegramPlane className="text-xl text-white/80 hover:text-[#B373FD]" />
          </Link>
          <Link href="#">
            <FaWhatsapp className="text-xl text-white/80 hover:text-[#B373FD]" />
          </Link>
          <Link href="#">
            <FaInstagram className="text-xl text-white/80 hover:text-[#B373FD]" />
          </Link>
          <Link href="#">
            <FaTwitter className="text-xl text-white/80 hover:text-[#B373FD]" />
          </Link>
          <Link href="#">
            <FaFacebookF className="text-xl text-white/80 hover:text-[#B373FD]" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
