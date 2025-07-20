import { ReactNode } from "react";
import styles from "./Layout.module.css";

interface GameLayoutProps {
	children: ReactNode;
	twoColumn?: boolean;
	className?: string;
}

/**
 * Game-specific layout with header, content, and actions areas
 */
export const GameLayout = ({
	children,
	twoColumn = false,
	className = "",
}: GameLayoutProps) => (
	<div
		className={`${styles.gameLayout} ${twoColumn ? styles.twoColumn : ""} ${className}`}
	>
		{children}
	</div>
);

interface GameHeaderProps {
	children: ReactNode;
	className?: string;
}

export const GameHeader = ({ children, className = "" }: GameHeaderProps) => (
	<div className={`${styles.gameHeader} ${className}`}>{children}</div>
);

interface GameContentProps {
	children: ReactNode;
	side?: "left" | "right";
	className?: string;
}

export const GameContent = ({
	children,
	side,
	className = "",
}: GameContentProps) => {
	const sideClass =
		side === "left"
			? styles.gameContentLeft
			: side === "right"
				? styles.gameContentRight
				: styles.gameContent;
	return <div className={`${sideClass} ${className}`}>{children}</div>;
};

interface GameActionsProps {
	children: ReactNode;
	className?: string;
}

export const GameActions = ({ children, className = "" }: GameActionsProps) => (
	<div className={`${styles.gameActions} ${className}`}>{children}</div>
);

interface CenterLayoutProps {
	children: ReactNode;
	className?: string;
}

/**
 * Centered layout for loading screens, home page, etc.
 */
export const CenterLayout = ({
	children,
	className = "",
}: CenterLayoutProps) => (
	<div className={`${styles.centerLayout} ${className}`}>{children}</div>
);

interface FormLayoutProps {
	children: ReactNode;
	className?: string;
}

/**
 * Form layout with consistent spacing and max-width
 */
export const FormLayout = ({ children, className = "" }: FormLayoutProps) => (
	<div className={`${styles.formLayout} ${className}`}>{children}</div>
);

interface FlexBoxProps {
	children: ReactNode;
	direction?: "row" | "column";
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
	gap?: "small" | "medium" | "large";
	wrap?: boolean;
	className?: string;
}

/**
 * Flexible box layout with common flex properties
 */
export const FlexBox = ({
	children,
	direction = "row",
	align = "stretch",
	justify = "start",
	gap = "medium",
	wrap = false,
	className = "",
}: FlexBoxProps) => {
	const flexDirection =
		direction === "column" ? styles.flexColumn : styles.flexRow;
	const gapClass =
		gap === "small"
			? styles.gapSmall
			: gap === "large"
				? styles.gapLarge
				: styles.gap;

	const alignItems = {
		start: "flex-start",
		center: "center",
		end: "flex-end",
		stretch: "stretch",
	}[align];

	const justifyContent = {
		start: "flex-start",
		center: "center",
		end: "flex-end",
		between: "space-between",
		around: "space-around",
		evenly: "space-evenly",
	}[justify];

	return (
		<div
			className={`${flexDirection} ${gapClass} ${className}`}
			style={{
				alignItems,
				justifyContent,
				flexWrap: wrap ? "wrap" : "nowrap",
			}}
		>
			{children}
		</div>
	);
};

interface SafeAreaProps {
	children: ReactNode;
	sides?: ("top" | "bottom" | "left" | "right")[];
	className?: string;
}

/**
 * Safe area wrapper for devices with notches/dynamic islands
 */
export const SafeArea = ({
	children,
	sides = ["bottom"],
	className = "",
}: SafeAreaProps) => {
	const safeClasses = sides
		.map((side) => {
			switch (side) {
				case "top":
					return styles.safeTop;
				case "bottom":
					return styles.safeBottom;
				case "left":
					return styles.safeLeft;
				case "right":
					return styles.safeRight;
				default:
					return "";
			}
		})
		.join(" ");

	return <div className={`${safeClasses} ${className}`}>{children}</div>;
};
