import sanitizeHtml from "sanitize-html";

const richTextTag = /<\/?(?:p|div|br|strong|b|em|i|u|s|span|h[1-6]|ul|ol|li|blockquote|a)(?:\s|\/?>)/i;

export function isProductRichText(value: string): boolean {
    return richTextTag.test(value);
}

/** Only the formatting supported by the product editor may reach the storefront. */
export function sanitizeProductHtml(value: string): string {
    return sanitizeHtml(value, {
        allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "span", "h2", "h3", "ul", "ol", "li", "blockquote"],
        allowedAttributes: { "*": ["style"], ol: ["start"] },
        allowedStyles: {
            "*": {
                color: [/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i],
                "font-size": [/^(12|14|16|18|20|24|28|32)px$/],
                "text-align": [/^(left|center|right|justify)$/],
            },
        },
    });
}

export function productDescriptionHtml(value: string): string {
    if (isProductRichText(value)) return sanitizeProductHtml(value);
    const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    return escaped.split(/\r?\n\r?\n/).map(paragraph => `<p>${paragraph.replace(/\r?\n/g, "<br>")}</p>`).join("");
}

export function productDescriptionText(value: string): string {
    if (!isProductRichText(value)) return value;
    return sanitizeHtml(value.replace(/<\/(p|h2|h3|li|blockquote)>|<br\s*\/?>/gi, " "), { allowedTags: [], allowedAttributes: {} })
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
