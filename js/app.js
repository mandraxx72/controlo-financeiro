/**
 * CONTROLO FINANCEIRO - Main Application
 * Initializes and coordinates all modules
 */

(function () {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        console.log('🚀 Controlo Financeiro - Iniciando...');

        try {
            // Initialize Charts Manager
            ChartsManager.init();
            console.log('📊 Charts Manager inicializado');

            // Initialize UI Manager (includes Data Manager initialization)
            UIManager.init();
            console.log('🎨 UI Manager inicializado');

            // Initialize Receipts Manager (IndexedDB)
            if (window.ReceiptsManager) {
                ReceiptsManager.init().then(() => {
                    console.log('📸 Receipts Manager inicializado');
                }).catch(err => {
                    console.error('❌ Erro ao iniciar Receipts Manager:', err);
                });
            }

            console.log('✅ Aplicativo iniciado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao iniciar aplicativo:', error);
        }
    });

    // Service Worker registration for offline support (optional)
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        window.addEventListener('load', function () {
            // Uncomment to enable service worker
            // navigator.serviceWorker.register('/sw.js')
            //     .then(function(registration) {
            //         console.log('ServiceWorker registered');
            //     })
            //     .catch(function(error) {
            //         console.log('ServiceWorker registration failed:', error);
            //     });
        });
    }
})();
