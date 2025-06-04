"use client";

import { useCalculations } from "@/context/calculation-context";
import { trackDownload, trackUserBehavior } from "@/lib/analytics";
import { bioreactors } from "@/lib/bioreactors";
import { LAB_EXT_LINK } from "@/lib/constants";
import { exportToCsv } from "@/lib/csv-export";
import { houseLogo, topRightCornerArrowLogo } from "@/lib/icons";
import { createShareableUrl } from "@/lib/url-params";
import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./icon";
import { useModal } from "@/context/modal-context";

const URL_COPIED_EVENT = "urlCopied";

const Navbar = () => {
  const pathname = usePathname();
  const { openModal } = useModal();
  const { activeReactorId, setActiveReactorId, expenses, costs } =
    useCalculations();

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const activeReactor = bioreactors.find((r) => r.id === activeReactorId);

  const isHome = pathname === "/";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      if (!target) return;

      if (
        !target.closest(".dropdown-container") &&
        !target.closest(".dropdown-button")
      ) {
        setIsDropdownOpen(false);
      }

      if (!target.closest(".sidebar") && !target.closest(".hamburger-button")) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const handleSelect = (id: string) => {
    setActiveReactorId(id);
    setIsDropdownOpen(false);

    const selectedReactor = bioreactors.find((r) => r.id === id);
    trackUserBehavior("bioreactor_selection", {
      reactor_id: id,
      reactor_name: selectedReactor?.name ?? "Unknown",
    });
  };

  const handleDownloadCsv = () => {
    if (expenses && activeReactor) {
      exportToCsv(expenses, activeReactor);
      trackDownload("csv", `${activeReactor.name}-expenses.csv`);
    }
    setIsSidebarOpen(false);
  };

  const handleSaveSettings = async () => {
    const shareableUrl = createShareableUrl(costs, activeReactorId);

    try {
      await navigator.clipboard.writeText(shareableUrl);
      setIsCopied(true);
      window.dispatchEvent(new Event(URL_COPIED_EVENT));
      trackUserBehavior("save_settings", {
        reactor_id: activeReactorId,
        success: true,
      });
    } catch (err) {
      console.error("Failed to copy URL: ", err);
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = shareableUrl;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      trackUserBehavior("save_settings", {
        reactor_id: activeReactorId,
        success: document.execCommand("copy"),
      });

      try {
        document.execCommand("copy");
        setIsCopied(true);
        window.dispatchEvent(new Event(URL_COPIED_EVENT));
      } catch (err) {
        console.error("Fallback: Failed to copy URL: ", err);
        alert("Please copy this URL manually: " + shareableUrl);
      }

      document.body.removeChild(textarea);
    }

    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    trackUserBehavior("toggle_sidebar", { opened: !isSidebarOpen });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    trackUserBehavior("toggle_dropdown", { opened: !isDropdownOpen });
  };

  return (
    <>
      <nav
        className='bg-white shadow-md py-3 mb-6 rounded-b-3xl fixed top-0 w-full z-40'
        role='navigation'
        aria-label='Main Navigation'
      >
        <div className='container mx-auto flex items-center justify-between px-4'>
          <Link href='/' className='flex items-center justify-start gap-x-1 '>
            <Image
              src={`${
                process.env.NEXT_PUBLIC_BASE_PATH ?? ""
              }/images/cv-logo.png`}
              alt='Cultivision Logo'
              width={40}
              height={40}
              priority
              className='object-contain'
            />
            <div
              className={cn(
                "flex flex-col items-start justify-center sm:flex",
                { hidden: isHome }
              )}
            >
              <div className='text-xl font-semibold text-slate-700'>
                CultiVision
              </div>
              <div className='text-xs font-medium italic'>
                Cultivated Meat Dashboard
              </div>
            </div>
          </Link>

          <div className='flex items-center justify-around gap-4'>
            {isHome && (
              <div className='relative dropdown-container'>
                <button
                  onClick={toggleDropdown}
                  className='dropdown-button cursor-pointer flex items-center space-x-1 md:space-x-2 bg-white border border-gray-300 rounded-md px-2 md:px-4 py-2  focus:outline-none focus:ring-1 focus:ring-slate-600 text-sm transition-all hover:shadow-md text-slate-700 hover:bg-gray-100 hover:border-slate-800'
                  aria-expanded={isDropdownOpen}
                  aria-controls='reactor-dropdown'
                  aria-haspopup='listbox'
                >
                  <span className='font-semibold'>Bioreactor:</span>
                  <span className='font-medium text-green-700'>
                    {activeReactor?.name || "Select"}
                  </span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={cn(
                      "h-5 w-5 transition-transform duration-200 ease-in-out",
                      {
                        "rotate-180": isDropdownOpen,
                      }
                    )}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>
                <div
                  className={cn(
                    `absolute top-full right-0 mt-2 py-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10 transition-all duration-200 ease-in-out`,
                    {
                      "opacity-100 visible translate-y-0": isDropdownOpen,
                    },
                    { "opacity-0 invisible -translate-y-2": !isDropdownOpen }
                  )}
                  id='reactor-dropdown'
                  role='listbox'
                >
                  {bioreactors.map((reactor) => (
                    <button
                      key={reactor.id}
                      onClick={() => handleSelect(reactor.id)}
                      className={cn(
                        "block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm cursor-pointer",
                        {
                          "bg-blue-50 font-medium":
                            activeReactorId === reactor.id,
                        }
                      )}
                    >
                      {reactor.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className='hamburger-button block xl:hidden md:p-2 focus:outline-none cursor-pointer'
            >
              <svg
                className='w-6 h-6 text-slate-700'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
            <div
              className={cn("hidden xl:flex items-center gap-4", {
                "gap-8": !isHome,
              })}
            >
              {isHome && (
                <button
                  className={cn(
                    "flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-2 text-sm transition-all hover:shadow-md text-slate-700 hover:bg-gray-100 hover:border-slate-800 cursor-pointer"
                  )}
                  onClick={openModal}
                >
                  <svg
                    className='h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                  Diagram
                </button>
              )}
              {isHome && (
                <button
                  onClick={handleSaveSettings}
                  className={cn(
                    "flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-2 text-sm transition-all hover:shadow-md text-slate-700 hover:bg-gray-100 hover:border-slate-800 cursor-pointer"
                  )}
                >
                  {isCopied ? (
                    <>
                      <svg
                        className='h-4 w-4 text-green-600'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      <span className='text-green-600'>URL Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
                        />
                      </svg>
                      <span>Share</span>
                    </>
                  )}
                </button>
              )}
              {isHome && (
                <button
                  onClick={handleDownloadCsv}
                  disabled={!expenses}
                  className='flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-2 text-sm transition-all hover:shadow-md text-slate-700 hover:bg-gray-100 hover:border-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <svg
                    className='h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  <span>Download CSV</span>
                </button>
              )}
              {!isHome && (
                <Link
                  href={"/"}
                  className='flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-2 text-sm transition-all hover:shadow-md text-slate-700 hover:bg-gray-100 hover:border-slate-800'
                >
                  <Icon
                    path={houseLogo.path}
                    viewBox={houseLogo.viewBox}
                    fill='#475569'
                  />
                  <span>Home</span>
                </Link>
              )}
              <Link
                href={LAB_EXT_LINK}
                target='_blank'
                rel='noreferrer nofollow'
                className='flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-2 text-sm transition-all hover:shadow-md text-slate-600 hover:bg-green-50 hover:border-green-500'
              >
                <Icon
                  path={topRightCornerArrowLogo.path}
                  viewBox={topRightCornerArrowLogo.viewBox}
                  fill='#475569'
                />
                <span>Our Lab</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div
        className={cn(
          `sidebar fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out`,
          { "translate-x-0": isSidebarOpen },
          { "translate-x-full": !isSidebarOpen }
        )}
        role='complementary'
        aria-label='Sidebar Menu'
      >
        <div className='p-6'>
          <div className='flex justify-between items-center mb-8'>
            <h2 className='text-xl font-semibold text-slate-700'>Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className='text-gray-500 hover:text-gray-700 cursor-pointer'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <div
            className={cn("flex flex-col space-y-8", { "space-y-4": isHome })}
          >
            <button
              className={cn(
                "flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-2 text-sm transition-all hover:shadow-md text-slate-700 hover:bg-gray-100 hover:border-slate-800 cursor-pointer"
              )}
              onClick={openModal}
            >
              <svg
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                />
              </svg>
              Diagram
            </button>
            {isHome && (
              <button
                onClick={handleSaveSettings}
                className={cn(
                  "flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-3 text-sm transition-all hover:shadow-md text-slate-700 hover:bg-gray-100 hover:border-slate-800 cursor-pointer w-full justify-start"
                )}
              >
                {isCopied ? (
                  <>
                    <svg
                      className='h-4 w-4 text-green-600'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span className='text-green-600'>URL Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
                      />
                    </svg>
                    <span>Save Inputs</span>
                  </>
                )}
              </button>
            )}
            {isHome && (
              <button
                onClick={handleDownloadCsv}
                disabled={!expenses}
                className='flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-3 text-sm transition-all hover:shadow-md text-slate-700 hover:bg-gray-100 hover:border-slate-800 cursor-pointer w-full justify-start disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <svg
                  className='h-4 w-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                <span>Download CSV</span>
              </button>
            )}
            {!isHome && (
              <Link
                href={"/"}
                className='flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-2 text-sm transition-all hover:shadow-md text-slate-700 hover:bg-gray-100 hover:border-slate-800'
              >
                <Icon
                  path={houseLogo.path}
                  viewBox={houseLogo.viewBox}
                  fill='#475569'
                />
                <span>Home</span>
              </Link>
            )}
            <Link
              href={LAB_EXT_LINK}
              target='_blank'
              rel='noreferrer nofollow'
              className='flex items-center gap-x-2 rounded-md border border-slate-300 py-2 px-3 text-sm transition-all hover:shadow-md text-slate-600 hover:bg-green-50 hover:border-green-500 w-full justify-start'
              onClick={() => setIsSidebarOpen(false)}
            >
              <Icon
                path={topRightCornerArrowLogo.path}
                viewBox={topRightCornerArrowLogo.viewBox}
                fill='#475569'
              />
              <span>Our Lab</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
