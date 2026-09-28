import { productDescriptionHtml } from "@/lib/productRichText";

export function ProductDescription({ value }: { value: string }) {
    return <div className="product-rich-text" dangerouslySetInnerHTML={{ __html: productDescriptionHtml(value) }} />;
}
