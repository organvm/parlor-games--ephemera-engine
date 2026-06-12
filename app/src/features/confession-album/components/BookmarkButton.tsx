import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const BookmarkButton = ({ entryId, onToggle }: { entryId: string, onToggle: (id: string, isBookmarked: boolean) => void }) => {
  const [bookmarked, setBookmarked] = useState(false);
  
  const handleToggle = () => {
    const newState = !bookmarked;
    setBookmarked(newState);
    onToggle(entryId, newState);
  };

  return (
    <TouchableOpacity style={[styles.btn, bookmarked && styles.active]} onPress={handleToggle}>
      <Text>{bookmarked ? 'Bookmarked' : 'Bookmark'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 },
  active: { backgroundColor: '#ffd700' }
});
