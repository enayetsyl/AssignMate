'use client';

import React from 'react';
import Link from 'next/link';
import { Menu as MenuIcon, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { menuItems } from '@/constant';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white shadow">
    <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
      {/* Left Side: Brand */}
      <div className="flex items-center">
        <span className="ml-2 font-bold text-xl">AssignMate</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-6">
        {menuItems.map((menu, index) => (
          <div key={index} className="flex items-center space-x-1">
            {/* The main link navigates directly */}
            <Link
              href={menu.href}
              className="px-3 py-2 hover:bg-gray-200 rounded"
            >
              {menu.title}
            </Link>

            {/* A small icon button triggers the dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open dropdown"
                  className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {menu.items.map((subItem, idx) => (
                  <DropdownMenuItem key={idx} asChild>
                    {/* Wrap subItem in Link for navigation */}
                    <Link href={subItem.href} className="cursor-pointer">
                      {subItem.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-200 rounded cursor-pointer">
              <MenuIcon className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {menuItems.map((menu, index) => (
              <div key={index} className="border-b last:border-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {/* The main link for navigation */}
                    <Link
                      href={menu.href}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {menu.title}
                    </Link>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 ml-4">
                    {menu.items.map((subItem, idx) => (
                      <DropdownMenuItem key={idx} asChild>
                        {/* Wrap subItem in Link for navigation */}
                        <Link href={subItem.href} className="cursor-pointer">
                          {subItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  </header>
);
};

export default Navbar;
