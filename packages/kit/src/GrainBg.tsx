/* Animated grain-gradient backdrop. Shader from Paper Shaders (Apache-2.0),
   the same one 21st.dev ships as "Grain Gradient". */
import { GrainGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "./hooks";

type Shape = "wave" | "dots" | "truchet" | "corners" | "ripple" | "blob" | "sphere";

export function GrainBg({
  colors = ["#7c5cff", "#ff3da5", "#c6ff3d"],
  colorBack = "#07070a",
  shape = "blob",
  speed = 0.45,
  dim = 0.55,
}: {
  colors?: string[];
  colorBack?: string;
  shape?: Shape;
  speed?: number;
  /** 0..1 how much the vignette darkens the shader so text stays readable. */
  dim?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <GrainGradient
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        colors={colors}
        colorBack={colorBack}
        softness={0.75}
        intensity={0.22}
        noise={0.4}
        shape={shape}
        speed={reduced ? 0 : speed}
        maxPixelCount={1280 * 1280}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, transparent 0%, rgba(7,7,10,${dim}) 60%, rgba(7,7,10,${Math.min(
            1,
            dim + 0.3,
          )}) 100%)`,
        }}
      />
    </div>
  );
}
