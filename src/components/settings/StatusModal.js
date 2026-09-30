import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ICONS = {
  success: '✅ ',
  error: '❌ ',
  warning: '⚠️ ',
  info: 'ℹ️ ',
};

const StatusModal = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.modalIcon}>{ICONS[type]}</Text>
              <Text
                style={[
                  styles.modalTitle,
                  type === 'success' && styles.modalTitleSuccess,
                  type === 'error' && styles.modalTitleError,
                  type === 'warning' && styles.modalTitleWarning,
                  type === 'info' && styles.modalTitleInfo,
                ]}
              >
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#607D8B" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>{message}</Text>
          </View>

          <View style={styles.modalFooter}>
            {type === 'warning' ? (
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={onClose}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={onConfirm}
                >
                  <Text style={styles.modalButtonConfirmText}>Clear</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonClose]}
                onPress={onClose}
              >
                <Text style={styles.modalButtonCloseText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StatusModal;