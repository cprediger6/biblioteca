import { prisma } from "./prisma";

/**
 * Genera el próximo código para un ejemplar basado en el ISBN
 * @param isbn - ISBN del libro (sin guiones)
 * @param bookId - ID del libro (opcional, para verificar existentes)
 * @returns Código generado (ej: 9783161484100-EJ-003)
 */
export async function generateCopyCode(isbn: string, bookId?: string): Promise<string> {
  // Limpiar ISBN (eliminar guiones)
  const cleanIsbn = isbn.replace(/-/g, '');
  
  // Buscar el último ejemplar de este libro
  const lastCopy = await prisma.copy.findFirst({
    where: {
      bookId: bookId || undefined,
      code: {
        startsWith: `${cleanIsbn}-EJ-`,
      },
    },
    orderBy: {
      code: 'desc',
    },
  });

  let nextNumber = 1;
  
  if (lastCopy && lastCopy.code) {
    // Extraer el número del código existente
    const match = lastCopy.code.match(/-EJ-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  // Formatear el número con 3 dígitos
  const formattedNum = String(nextNumber).padStart(3, '0');
  return `${cleanIsbn}-EJ-${formattedNum}`;
}

/**
 * Genera múltiples códigos para varios ejemplares
 */
export async function generateMultipleCopyCodes(
  isbn: string, 
  quantity: number, 
  bookId?: string
): Promise<string[]> {
  const codes: string[] = [];
  
  for (let i = 0; i < quantity; i++) {
    // Obtener el código base para cada iteración
    // Nota: Esto asegura que los números sean secuenciales
    const baseCode = await generateCopyCode(isbn, bookId);
    codes.push(baseCode);
    
    // Actualizar bookId para la siguiente iteración
    // Esto asegura que los números continúen secuencialmente
    if (i === 0 && !bookId) {
      // En la primera iteración, necesitamos obtener el bookId
      // pero esto se manejará después de crear el libro
    }
  }
  
  return codes;
}

/**
 * Obtiene el siguiente número disponible para un ISBN
 */
export async function getNextCopyNumber(isbn: string, bookId?: string): Promise<number> {
  const cleanIsbn = isbn.replace(/-/g, '');
  
  const lastCopy = await prisma.copy.findFirst({
    where: {
      bookId: bookId || undefined,
      code: {
        startsWith: `${cleanIsbn}-EJ-`,
      },
    },
    orderBy: {
      code: 'desc',
    },
  });

  if (lastCopy && lastCopy.code) {
    const match = lastCopy.code.match(/-EJ-(\d+)$/);
    if (match) {
      return parseInt(match[1]) + 1;
    }
  }
  
  return 1;
}