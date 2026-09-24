import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
    const clashDisplay = await readFile(
        join(process.cwd(), "public/fonts/ClashDisplay-Semibold.ttf")
    );

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#171717",
                    borderRadius: "7px",
                    color: "#fafafa",
                    fontFamily: "Clash Display",
                    fontSize: "22px",
                    lineHeight: 1,
                }}
            >
                J
            </div>
        ),
        {
            ...size,
            fonts: [{ name: "Clash Display", data: clashDisplay, weight: 600, style: "normal" }],
        }
    );
}
