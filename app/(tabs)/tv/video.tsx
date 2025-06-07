import { useLocalSearchParams } from "expo-router"
import { Text, View } from "react-native"

export default function VideoScreen() {
  const { id, title } = useLocalSearchParams()
  
  return (
    <View>
      <Text>Video for {title}</Text>
    </View>
  )
} 