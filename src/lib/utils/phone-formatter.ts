/**
 * Utilitaires pour formater les numéros de téléphone gabonais
 */

/**
 * Normalise un numéro de téléphone gabonais vers le nouveau format
 * Ancien format: 241 0X XXX XXX (10 chiffres)
 * Nouveau format: 241 XX XXX XXX (9 chiffres)
 * 
 * @param phoneNumber - Numéro à normaliser
 * @returns Numéro normalisé au nouveau format
 */
export function normalizeGabonPhoneNumber(phoneNumber: string): string {
  // Enlever tous les espaces et caractères spéciaux sauf +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '')
  
  // Enlever le + si présent
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }
  
  // Si le numéro commence par 241 (code Gabon)
  if (cleaned.startsWith('241')) {
    const afterCode = cleaned.substring(3) // Partie après 241
    
    // Si c'est l'ancien format avec 0 (10 chiffres après 241)
    if (afterCode.length === 10 && afterCode.startsWith('0')) {
      // Convertir vers le nouveau format
      // 24106871309 → 24166871309
      const firstDigit = afterCode[1] // Le chiffre après le 0
      const restOfNumber = afterCode.substring(2) // Le reste
      
      // Nouveau format: 241 + 1 ou 2 ou 5 ou 6 ou 7 + reste
      return `241${firstDigit}${restOfNumber}`
    }
    
    // Si c'est déjà le nouveau format (9 chiffres après 241)
    if (afterCode.length === 9) {
      return cleaned
    }
  }
  
  // Retourner tel quel si pas un numéro gabonais ou format inconnu
  return cleaned
}

/**
 * Formate un numéro pour l'affichage
 * @param phoneNumber - Numéro à formater
 * @returns Numéro formaté pour l'affichage (ex: +241 XX XXX XXX)
 */
export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  const normalized = normalizeGabonPhoneNumber(phoneNumber)
  
  if (normalized.startsWith('241') && normalized.length === 12) {
    // Format: +241 XX XXX XXX
    return `+${normalized.substring(0, 3)} ${normalized.substring(3, 5)} ${normalized.substring(5, 8)} ${normalized.substring(8)}`
  }
  
  return `+${normalized}`
}

/**
 * Convertit un numéro vers le format WhatsApp (chatId)
 * @param phoneNumber - Numéro à convertir
 * @returns Chat ID WhatsApp (ex: 24166871309@s.whatsapp.net)
 */
export function toWhatsAppChatId(phoneNumber: string): string {
  const normalized = normalizeGabonPhoneNumber(phoneNumber)
  return `${normalized}@s.whatsapp.net`
}

/**
 * Exemples de numéros gabonais valides
 */
export const GABON_PHONE_EXAMPLES = {
  oldFormat: '24106871309',
  newFormat: '24166871309',
  withPlus: '+24166871309',
  withSpaces: '+241 66 871 309',
}

/**
 * Teste si un numéro est un numéro gabonais valide
 */
export function isValidGabonPhoneNumber(phoneNumber: string): boolean {
  const normalized = normalizeGabonPhoneNumber(phoneNumber)
  
  // Doit commencer par 241 et avoir 12 chiffres au total
  if (!normalized.startsWith('241') || normalized.length !== 12) {
    return false
  }
  
  // Le premier chiffre après 241 doit être 1, 2, 5, 6 ou 7
  const firstDigit = normalized[3]
  return ['1', '2', '5', '6', '7'].includes(firstDigit)
}
