import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export function Pagination({ currentPage, totalPages, onPageChange, loading = false }: PaginationProps) {
  const handlePagePress = (page: number) => {
    if (page !== currentPage && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPageChange(page)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPageChange(currentPage + 1)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage <= 3) {
        // Show pages 1, 2, 3, 4, ..., last
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        if (totalPages > 4) {
          pages.push("...")
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 2) {
        // Show pages 1, ..., last-3, last-2, last-1, last
        if (totalPages > 4) {
          pages.push("...")
        }
        for (let i = totalPages - 3; i <= totalPages; i++) {
          if (i > 1) pages.push(i)
        }
      } else {
        // Show pages 1, ..., current-1, current, current+1, ..., last
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(300)}>
      <View style={styles.paginationContainer}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[styles.pageButton, styles.navButton, currentPage === 1 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentPage === 1 || loading}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-left" size={18} color={currentPage === 1 ? "#666666" : "#FFFFFF"} />
        </TouchableOpacity>

        {/* Page Numbers */}
        <View style={styles.pageNumbersContainer}>
          {getPageNumbers().map((page, index) => (
            <TouchableOpacity
              key={`page-${index}`}
              style={[
                styles.pageButton,
                page === currentPage && styles.activePageButton,
                typeof page === "string" && styles.ellipsisButton,
              ]}
              onPress={() => typeof page === "number" && handlePagePress(page)}
              disabled={typeof page === "string" || loading}
              activeOpacity={0.7}
            >
              {typeof page === "string" ? (
                <MaterialCommunityIcons name="more" size={16} color="#888888" />
              ) : (
                <Text
                  style={[
                    styles.pageButtonText,
                    page === currentPage && styles.activePageButtonText,
                  ]}
                >
                  {page}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.pageButton, styles.navButton, currentPage === totalPages && styles.disabledButton]}
          onPress={handleNext}
          disabled={currentPage === totalPages || loading}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-right" size={18} color={currentPage === totalPages ? "#666666" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>

      {/* Page Info */}
      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  navButton: {
    backgroundColor: "#2A2A2A",
  },
  activePageButton: {
    backgroundColor: "#E50914",
  },
  disabledButton: {
    backgroundColor: "#0F0F0F",
  },
  ellipsisButton: {
    backgroundColor: "transparent",
  },
  pageButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#FFFFFF",
  },
  activePageButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  pageInfo: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
  },
})
