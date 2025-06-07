import { View, Text, StyleSheet } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"

interface EmptyStateProps {
    icon: React.ReactNode
    title: string
    subtitle?: string
    children?: React.ReactNode
}

export function EmptyState({ icon, title, subtitle, children }: EmptyStateProps) {
    return (
        <Animated.View style={styles.container} entering={FadeIn.duration(500)}>
            <View style={styles.iconContainer}>{icon}</View>

            <Text style={styles.title}>{title}</Text>

            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            {children && <View style={styles.actionContainer}>{children}</View>}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    iconContainer: {
        marginBottom: 24,
        opacity: 0.6,
    },
    title: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#888888",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    actionContainer: {
        width: "100%",
        alignItems: "center",
    },
})
