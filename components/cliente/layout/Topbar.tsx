"use client";

import {
  Menu,
  Search,
  Bell,
  ChevronDown
} from "lucide-react";

import { useSession } from "next-auth/react";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({
  onMenuClick,
}: TopbarProps) {

  const { data: session } = useSession();

  return (

    <header className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-xl border-b border-gray-800">

      <div className="h-20 px-6 flex items-center justify-between">

        {/* Izquierda */}

        <div className="flex items-center gap-4">

          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 rounded-xl bg-[#18181B] hover:bg-[#27272A] flex items-center justify-center transition"
          >
            <Menu size={22} />
          </button>

          {/* Buscador */}

          <div className="hidden md:flex items-center bg-[#18181B] border border-gray-800 rounded-2xl px-4 w-[420px]">

            <Search
              size={18}
              className="text-gray-500"
            />

            <input
              type="text"
              placeholder="Buscar libros, autores o categorías..."
              className="bg-transparent outline-none px-3 py-3 w-full placeholder:text-gray-500"
            />

          </div>

        </div>

        {/* Derecha */}

        <div className="flex items-center gap-4">

          <button className="relative w-11 h-11 rounded-xl bg-[#18181B] hover:bg-[#27272A] transition flex items-center justify-center">

            <Bell size={20} />

            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"/>

          </button>

          <button className="flex items-center gap-3 bg-[#18181B] hover:bg-[#27272A] rounded-2xl px-3 py-2 transition">

            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">

              {session?.user?.name?.charAt(0) ?? "U"}

            </div>

            <div className="hidden sm:block text-left">

              <p className="font-medium">

                {session?.user?.name ?? "Usuario"}

              </p>

              <p className="text-xs text-gray-400">

                Cliente

              </p>

            </div>

            <ChevronDown
              size={18}
              className="text-gray-500"
            />

          </button>

        </div>

      </div>

    </header>

  );

}