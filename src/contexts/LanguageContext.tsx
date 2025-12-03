'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (translations: Record<Language, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'guiltless-cakes-language';

function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('pt')) return 'pt';
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (savedLang && ['en', 'es', 'pt'].includes(savedLang)) {
      setLanguageState(savedLang);
    } else {
      setLanguageState(getBrowserLanguage());
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const t = (translations: Record<Language, string>): string => {
    return translations[language] || translations['en'] || '';
  };

  // Prevent hydration mismatch by not rendering until initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Static translations for common UI elements
export const translations = {
  nav: {
    home: { en: 'Home', es: 'Inicio', pt: 'Início' },
    menu: { en: 'Menu', es: 'Menú', pt: 'Cardápio' },
    customCakes: { en: 'Custom Cakes', es: 'Pasteles Personalizados', pt: 'Bolos Personalizados' },
    about: { en: 'About', es: 'Nosotros', pt: 'Sobre' },
    pickup: { en: 'Pickup Info', es: 'Información de Recogida', pt: 'Informações de Retirada' },
    contact: { en: 'Contact', es: 'Contacto', pt: 'Contato' },
    account: { en: 'My Account', es: 'Mi Cuenta', pt: 'Minha Conta' },
    orders: { en: 'My Orders', es: 'Mis Pedidos', pt: 'Meus Pedidos' },
    settings: { en: 'Settings', es: 'Configuración', pt: 'Configurações' },
    signIn: { en: 'Sign In', es: 'Iniciar Sesión', pt: 'Entrar' },
    signOut: { en: 'Sign Out', es: 'Cerrar Sesión', pt: 'Sair' },
  },
  cart: {
    title: { en: 'Your Cart', es: 'Tu Carrito', pt: 'Seu Carrinho' },
    empty: { en: 'Your cart is empty', es: 'Tu carrito está vacío', pt: 'Seu carrinho está vazio' },
    subtotal: { en: 'Subtotal', es: 'Subtotal', pt: 'Subtotal' },
    checkout: { en: 'Checkout', es: 'Finalizar Compra', pt: 'Finalizar Compra' },
    continueShopping: { en: 'Continue Shopping', es: 'Seguir Comprando', pt: 'Continuar Comprando' },
    remove: { en: 'Remove', es: 'Eliminar', pt: 'Remover' },
  },
  menu: {
    thisWeek: { en: "This Week's Menu", es: 'Menú de esta Semana', pt: 'Cardápio desta Semana' },
    addToCart: { en: 'Add to Cart', es: 'Agregar al Carrito', pt: 'Adicionar ao Carrinho' },
    soldOut: { en: 'Sold Out', es: 'Agotado', pt: 'Esgotado' },
    orderClosed: { en: 'Ordering Closed', es: 'Pedidos Cerrados', pt: 'Pedidos Encerrados' },
  },
  inquiry: {
    title: { en: 'Custom Cake Inquiry', es: 'Consulta de Pastel Personalizado', pt: 'Consulta de Bolo Personalizado' },
    submit: { en: 'Submit Inquiry', es: 'Enviar Consulta', pt: 'Enviar Consulta' },
    success: { en: 'Inquiry Submitted!', es: '¡Consulta Enviada!', pt: 'Consulta Enviada!' },
  },
  common: {
    loading: { en: 'Loading...', es: 'Cargando...', pt: 'Carregando...' },
    error: { en: 'An error occurred', es: 'Ocurrió un error', pt: 'Ocorreu um erro' },
    save: { en: 'Save', es: 'Guardar', pt: 'Salvar' },
    cancel: { en: 'Cancel', es: 'Cancelar', pt: 'Cancelar' },
    back: { en: 'Back', es: 'Volver', pt: 'Voltar' },
    next: { en: 'Next', es: 'Siguiente', pt: 'Próximo' },
  },
  footer: {
    rights: { en: 'All rights reserved', es: 'Todos los derechos reservados', pt: 'Todos os direitos reservados' },
    madeWith: { en: 'Made with love in Northeast Philadelphia', es: 'Hecho con amor en el noreste de Filadelfia', pt: 'Feito com amor no nordeste da Filadélfia' },
  },
};
