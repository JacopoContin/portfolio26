"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps, type MotionValue, useMotionValue, useSpring, useTransform } from "motion/react";
import { createContext, useContext, useRef, type ReactNode, type Ref } from "react";

interface DockProps {
  className?: string;
  children: ReactNode;
  magnification?: number;
  distance?: number;
}

interface DockIconProps extends HTMLMotionProps<"div"> {
  className?: string;
  children?: ReactNode;
  /** Forwarded so `asChild` wrappers (tooltips, popovers) can anchor to the icon. */
  ref?: Ref<HTMLDivElement>;
}

const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 100;
const BASE_SIZE = 40;
const BASE_ICON_SIZE = 20;
const ICON_SIZE_RATIO = 0.5;
const SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

interface DockContextValue {
  mouseX: MotionValue<number>;
  magnification: number;
  distance: number;
}

const DockContext = createContext<DockContextValue | null>(null);

const Dock = ({ className, children, magnification = DEFAULT_MAGNIFICATION, distance = DEFAULT_DISTANCE }: DockProps) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <DockContext.Provider value={{ mouseX, magnification, distance }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn("mx-auto w-max h-full flex items-end justify-center overflow-visible rounded-full border", className)}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
};

const DockIcon = ({ className, children, ref: forwardedRef, ...props }: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const context = useContext(DockContext);

  if (!context) {
    throw new Error("DockIcon must be used within a Dock component");
  }

  const { mouseX, magnification, distance } = context;

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const containerSize = useSpring(
    useTransform(distanceCalc, [-distance, 0, distance], [BASE_SIZE, magnification, BASE_SIZE]),
    SPRING
  );
  const iconSize = useSpring(
    useTransform(distanceCalc, [-distance, 0, distance], [BASE_ICON_SIZE, magnification * ICON_SIZE_RATIO, BASE_ICON_SIZE]),
    SPRING
  );

  const setRefs = (node: HTMLDivElement | null) => {
    ref.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  return (
    <motion.div
      {...props}
      ref={setRefs}
      style={{ width: containerSize, height: containerSize }}
      className={cn("relative flex aspect-square items-center justify-center rounded-full shrink-0", className)}
    >
      <motion.div
        style={{ width: iconSize, height: iconSize }}
        className="flex items-center justify-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export { Dock, DockIcon };
export type { DockProps, DockIconProps };
