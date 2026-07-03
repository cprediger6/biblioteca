"use client";

import Link from "next/link";

export default function Footer() {

  return (

    <footer className="border-t border-gray-800 bg-[#09090B]">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid md:grid-cols-4 gap-10">

          <div>

            <h3 className="font-bold text-lg mb-4">

              📚 Biblioteca+

            </h3>

            <p className="text-gray-400 text-sm">

              Plataforma moderna para descubrir, reservar y disfrutar miles de libros desde cualquier lugar.

            </p>

          </div>

          <div>

            <h4 className="font-semibold mb-3">

              Biblioteca

            </h4>

            <ul className="space-y-2 text-gray-400 text-sm">

              <li>

                <Link href="/cliente/catalogo">

                  Catálogo

                </Link>

              </li>

              <li>

                <Link href="/cliente/reservas">

                  Reservas

                </Link>

              </li>

              <li>

                <Link href="/cliente/history">

                  Historial

                </Link>

              </li>

            </ul>

          </div>

          <div>

            <h4 className="font-semibold mb-3">

              Cuenta

            </h4>

            <ul className="space-y-2 text-gray-400 text-sm">

              <li>

                <Link href="/cliente/profile">

                  Perfil

                </Link>

              </li>

              <li>

                <Link href="/cliente/payments">

                  Pagos

                </Link>

              </li>

            </ul>

          </div>

          <div>

            <h4 className="font-semibold mb-3">

              Soporte

            </h4>

            <p className="text-sm text-gray-400">

              soporte@biblioteca.com

            </p>

            <p className="text-sm text-gray-400">

              +507 6000-0000

            </p>

          </div>

        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between text-sm text-gray-500">

          <span>

            © 2026 Biblioteca+. Todos los derechos reservados.

          </span>

          <span>

            Desarrollado con Next.js + Prisma

          </span>

        </div>

      </div>

    </footer>

  );

}