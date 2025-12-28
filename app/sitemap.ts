import { MetadataRoute } from "next";
import { CALCULATORS, SITE } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://fin-calc.vercel.app";

    // Generate calculator URLs from config
    const calculatorUrls = CALCULATORS.map((calc) => ({
        url: `${baseUrl}/${calc.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.9,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 1.0,
        },
        ...calculatorUrls,
    ];
}
