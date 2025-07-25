export function escapeHTML(str: string): string {
    return str.replace(/[&<>"]/g, (char) => (
        {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        }[char] || char
    ));
}