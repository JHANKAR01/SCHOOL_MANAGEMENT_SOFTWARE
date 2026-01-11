import React from 'react';
import { View, ViewProps } from 'react-native';

interface RowProps extends ViewProps {
    className?: string;
}

/**
 * A Flexbox wrapper that behaves like a Grid Row.
 * Replaces: <div className="grid grid-cols-..." />
 */
export const Row: React.FC<RowProps> = ({ children, className, style, ...props }) => {
    return (
        <View
            className={`flex-row flex-wrap ${className || ''}`}
            style={[{ marginHorizontal: -8 }, style]} // Negative margin to offset column padding
            {...props}
        >
            {children}
        </View>
    );
};

interface ColProps extends ViewProps {
    // You can pass Tailwind width classes here: "w-full md:w-1/2 lg:w-1/4"
    className?: string;
}

/**
 * A Column item that automatically adds padding (gutters).
 * Replaces: <div className="..."> inside a grid
 */
export const Col: React.FC<ColProps> = ({ children, className, style, ...props }) => {
    return (
        <View
            className={`p-2 ${className || ''}`} // p-2 creates the "gap" visually
            style={style}
            {...props}
        >
            {children}
        </View>
    );
};
