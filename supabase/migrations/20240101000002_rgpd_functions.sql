-- Function to handle RGPD data deletion
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_phone TEXT;
BEGIN
  -- Get user phone before deletion
  SELECT phone_number INTO user_phone FROM users WHERE id = target_user_id;
  
  -- Log the deletion
  INSERT INTO deletion_logs (user_id, phone_number, reason)
  VALUES (target_user_id, user_phone, 'User requested deletion via SUPPRIMER keyword');
  
  -- Delete user data (cascading deletes will handle related records)
  DELETE FROM users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check consent status
CREATE OR REPLACE FUNCTION check_user_consent(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  latest_consent BOOLEAN;
BEGIN
  SELECT consent_given INTO latest_consent
  FROM consent_logs
  WHERE user_id = target_user_id
  ORDER BY timestamp DESC
  LIMIT 1;
  
  RETURN COALESCE(latest_consent, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log consent
CREATE OR REPLACE FUNCTION log_user_consent(
  target_user_id UUID,
  consent_status BOOLEAN
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO consent_logs (user_id, consent_given)
  VALUES (target_user_id, consent_status)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user data for export (RGPD data portability)
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user', (SELECT row_to_json(u.*) FROM users u WHERE id = target_user_id),
    'consent_logs', (SELECT jsonb_agg(row_to_json(c.*)) FROM consent_logs c WHERE user_id = target_user_id),
    'conversations', (SELECT jsonb_agg(row_to_json(conv.*)) FROM conversations conv WHERE user_id = target_user_id),
    'orders', (SELECT jsonb_agg(row_to_json(o.*)) FROM orders o WHERE user_id = target_user_id),
    'loyalty_coupons', (SELECT jsonb_agg(row_to_json(lc.*)) FROM loyalty_coupons lc WHERE user_id = target_user_id),
    'satisfaction_surveys', (SELECT jsonb_agg(row_to_json(ss.*)) FROM satisfaction_surveys ss WHERE user_id = target_user_id)
  ) INTO user_data;
  
  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize old conversations (data retention policy)
CREATE OR REPLACE FUNCTION anonymize_old_conversations(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  WITH deleted_convs AS (
    UPDATE conversations
    SET user_id = NULL,
        conversation_data = '{}'::JSONB
    WHERE ended_at < NOW() - (days_old || ' days')::INTERVAL
    AND user_id IS NOT NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO affected_rows FROM deleted_convs;
  
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
