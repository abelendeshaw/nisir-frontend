export const THEME_STORAGE_KEY = "nisir-theme";

/**
 * Inlined in <head> so a stored preference is applied before first paint.
 * With no stored choice the attribute stays off and the OS preference wins —
 * which is this site's documented default.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;
