// Mobile performance optimization
if (typeof window !== 'undefined') {
  // Detect mobile devices
  const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  
  if (isMobile) {
    // Reduce memory pressure on mobile
    console.log('[MOBILE] Mobile device detected - applying optimizations');
    
    // Disable HMR on mobile to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      console.log('[MOBILE] Development mode - disabling HMR for mobile stability');
      (window as any).__webpack_require__ = undefined;
    }
    
    // Enable mobile-specific optimizations
    if ((performance as any)?.memory) {
      const memInfo = (performance as any).memory;
      console.log('[MOBILE] Memory info:', {
        used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      });
      
      // Monitor memory usage
      setInterval(() => {
        const current = (performance as any).memory;
        if (current.usedJSHeapSize / current.jsHeapSizeLimit > 0.8) {
          console.warn('[MOBILE] High memory usage detected:', 
            Math.round(current.usedJSHeapSize / 1024 / 1024) + 'MB');
          // Force garbage collection if available
          if ((window as any).gc) {
            (window as any).gc();
          }
        }
      }, 30000); // Check every 30 seconds
    }
    
    // Prevent viewport zoom issues
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }
}

export {};