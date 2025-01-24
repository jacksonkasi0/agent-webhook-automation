const { URL } = require('url');

/**
 * Normalize a domain or URL to `https://www.example.com` format.
 * @param {string} domain - The input domain or URL.
 * @returns {string} - The normalized URL in `https://www.example.com` format.
 */
function normalizeDomain(domain) {
    try {
        // Trim any leading or trailing whitespace from the input
        domain = domain.trim();

        // Handle empty or null input
        if (!domain) {
            throw new Error('Input domain is empty.');
        }

        // Add protocol if missing
        if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
            domain = `https://${domain}`;
        }

        // Parse the domain using URL module
        const parsedUrl = new URL(domain);

        // Ensure the hostname starts with "www."
        let hostname = parsedUrl.hostname.toLowerCase(); // Ensure case-insensitivity
        if (!hostname.startsWith('www.')) {
            hostname = `www.${hostname.replace(/^www\./, '')}`;
        }

        // Return the normalized URL with "https" protocol and "www." prefix
        return `https://${hostname}`;
    } catch (error) {
        console.error(`❌ Error normalizing domain "${domain}":`, error.message);
        throw new Error('Invalid domain or URL format.');
    }
}

module.exports = { normalizeDomain };
