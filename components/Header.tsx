
import React, { useState } from 'react';
import { Icon } from './Icon';
import { SearchDialog } from './SearchDialog';

export const Header: React.FC = () => {
  const [isSearchOpen, setSearchOpen] = useState(false);

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/60 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left/Central Section */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Menu principal"
              >
                <Icon name="menu" />
              </button>
              <div className="w-full hidden sm:block">
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-haspopup="dialog"
                  className="w-full h-12 px-4 flex items-center gap-3 bg-gray-100 dark:bg-gray-700/50 rounded-full text-left text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon name="search" size="sm" />
                  <span className="text-sm">Buscar cursos, trilhas, eventos...</span>
                </button>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2">
               <button
                  onClick={() => setSearchOpen(true)}
                  aria-haspopup="dialog"
                  className="sm:hidden w-12 h-12 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Buscar"
                >
                  <Icon name="search" />
                </button>
              <button
                disabled
                className="w-12 h-12 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Adicionar"
              >
                <Icon name="add" />
              </button>
              <button
                onClick={handleFullScreen}
                className="w-12 h-12 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Tela cheia"
              >
                <Icon name="fullscreen" />
              </button>
              <button
                className="w-12 h-12 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Notificações"
              >
                <Icon name="notifications" />
              </button>
              <button
                className="w-12 h-12 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Aplicações"
              >
                <Icon name="apps" />
              </button>

              <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
              
              <div className="hidden sm:flex items-center gap-1.5 p-2 rounded-lg">
                  <Icon name="payments" size="sm" className="text-gray-800 dark:text-gray-300"/>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">1,250</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider uppercase">Pontos</span>
                  </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <img
                  className="h-8 w-8 rounded-full object-cover"
                  src="https://i.pravatar.cc/40?u=leader"
                  alt="User profile"
                  />
                  <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Maria Fernanda</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Líder de Vendas</span>
                  </div>
                  <Icon name="expand_more" className="hidden md:block text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <SearchDialog isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
