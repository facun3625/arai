import assert from "node:assert/strict";
import { test } from "node:test";
import { productDescriptionHtml, productDescriptionText, sanitizeProductHtml } from "./productRichText";

test("legacy descriptions retain line breaks and literal characters", () => {
    assert.equal(productDescriptionHtml('Yerba & mate < 10\nOtra línea\n\nNuevo párrafo'), '<p>Yerba &amp; mate &lt; 10<br>Otra línea</p><p>Nuevo párrafo</p>');
});

test("supported editor formatting survives sanitization", () => {
    const html = '<h2 style="text-align:center">Origen</h2><p><span style="color:#23553d;font-size:18px"><strong>Misiones</strong></span></p><ul><li><p>Natural</p></li></ul>';
    assert.equal(sanitizeProductHtml(html), html);
});

test("scripts, handlers, unsafe styles and embedded content are removed", () => {
    const html = sanitizeProductHtml('<p onclick="alert(1)" style="position:fixed;color:#23553d;font-size:999px;background:url(javascript:alert(1))">Yerba<script>alert(1)</script><img src=x onerror="alert(1)"><iframe src="https://example.com"></iframe></p>');
    assert.equal(html, '<p style="color:#23553d">Yerba</p>');
});

test("metadata receives readable text rather than HTML", () => {
    assert.equal(productDescriptionText('<h2>Yerba &amp; mate</h2><p><strong>Origen:</strong> Misiones</p>'), 'Yerba & mate Origen: Misiones');
});
