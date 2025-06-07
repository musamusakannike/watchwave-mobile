import { useLocalSearchParams } from "expo-router"
import { Text, View } from "react-native"

export default function SeasonsScreen() {
  const { id, title } = useLocalSearchParams()
  
  return (
    <View>
      <Text>Seasons for {title}</Text>
    </View>
  )
} 