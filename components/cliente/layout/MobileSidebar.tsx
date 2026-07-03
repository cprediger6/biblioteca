"use client";

import Link from "next/link";

import { X } from "lucide-react";

import Sidebar from "./Sidebar";

interface Props {

  open: boolean;

  onClose: () => void;

}

export default function MobileSidebar({

  open,

  onClose,

}: Props) {

  if (!open) return null;

  return (

    <>

      {/* Fondo */}

      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
      />

      {/* Drawer */}

      <div className="fixed left-0 top-0 bottom-0 w-80 bg-[#111827] z-50 lg:hidden shadow-2xl flex flex-col">

        <div className="flex justify-between items-center px-6 h-20 border-b border-gray-800">

          <Link
            href="/cliente/dashboard"
            onClick={onClose}
          >

            <h2 className="font-bold text-xl">

              📚 Biblioteca+

            </h2>

          </Link>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#18181B] hover:bg-[#27272A]"
          >

            <X className="mx-auto"/>

          </button>

        </div>

        <div className="flex-1 overflow-auto">

          <Sidebar />

        </div>

      </div>

    </>

  );

}