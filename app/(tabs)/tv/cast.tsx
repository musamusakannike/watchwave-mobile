import { useLocalSearchParams } from "expo-router"
import { Text, View } from "react-native"

export default function CastScreen() {
  const { id, type, title } = useLocalSearchParams()
  
  return (
    <View>
      <Text>Cast for {title}</Text>
    </View>
  )
} 