import { Image } from "expo-image"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import Animated, { FadeInRight } from "react-native-reanimated"

interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string
}

interface Providers {
  flatrate?: Provider[]
  rent?: Provider[]
  buy?: Provider[]
}

export function WatchProviders({ providers }: { providers: Providers }) {
  const renderProviderSection = (title: string, providerList: Provider[] | undefined) => {
    if (!providerList || providerList.length === 0) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {providerList.map((provider: Provider, index: number) => (
            <Animated.View
              key={provider.provider_id}
              style={styles.providerCard}
              entering={FadeInRight.delay(index * 100).duration(500)}
            >
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w92${provider.logo_path}` }}
                style={styles.providerLogo}
                contentFit="cover"
              />
              <Text style={styles.providerName} numberOfLines={2}>
                {provider.provider_name}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {renderProviderSection("Stream", providers.flatrate)}
      {renderProviderSection("Rent", providers.rent)}
      {renderProviderSection("Buy", providers.buy)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#CCCCCC",
  },
  providerCard: {
    alignItems: "center",
    marginRight: 12,
    width: 60,
  },
  providerLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
    marginBottom: 4,
  },
  providerName: {
    fontFamily: "Poppins-Regular",
    fontSize: 10,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 12,
  },
})
