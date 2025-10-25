-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE satisfaction_surveys ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM users WHERE id = auth.uid()),
    'anonymous'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is product editor or admin
CREATE OR REPLACE FUNCTION auth.can_edit_products()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'product_editor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is support staff
CREATE OR REPLACE FUNCTION auth.is_support_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'support')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid() OR auth.is_support_staff());

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (auth.is_admin());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Products table policies
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (active = TRUE OR auth.can_edit_products());

CREATE POLICY "Product editors can manage products"
  ON products FOR ALL
  USING (auth.can_edit_products())
  WITH CHECK (auth.can_edit_products());

-- Conversations table policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (user_id = auth.uid() OR auth.is_support_staff());

CREATE POLICY "Support staff can manage conversations"
  ON conversations FOR ALL
  USING (auth.is_support_staff())
  WITH CHECK (auth.is_support_staff());

-- Messages table policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (user_id = auth.uid() OR auth.is_support_staff())
    )
  );

CREATE POLICY "Support staff can manage messages"
  ON messages FOR ALL
  USING (auth.is_support_staff())
  WITH CHECK (auth.is_support_staff());

-- Consent logs policies
CREATE POLICY "Users can view their own consent logs"
  ON consent_logs FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Admins can view all consent logs"
  ON consent_logs FOR SELECT
  USING (auth.is_admin());

CREATE POLICY "System can insert consent logs"
  ON consent_logs FOR INSERT
  WITH CHECK (TRUE);

-- Deletion logs policies (admin only)
CREATE POLICY "Admins can view deletion logs"
  ON deletion_logs FOR SELECT
  USING (auth.is_admin());

CREATE POLICY "System can insert deletion logs"
  ON deletion_logs FOR INSERT
  WITH CHECK (TRUE);

-- Recommendations policies
CREATE POLICY "Users can view recommendations in their conversations"
  ON recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = recommendations.conversation_id 
      AND (user_id = auth.uid() OR auth.is_support_staff())
    )
  );

CREATE POLICY "System can manage recommendations"
  ON recommendations FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Advisor alerts policies
CREATE POLICY "Support staff can view and manage alerts"
  ON advisor_alerts FOR ALL
  USING (auth.is_support_staff())
  WITH CHECK (auth.is_support_staff());

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid() OR auth.is_support_staff());

CREATE POLICY "Support staff can manage orders"
  ON orders FOR ALL
  USING (auth.is_support_staff())
  WITH CHECK (auth.is_support_staff());

-- Loyalty coupons policies
CREATE POLICY "Users can view their own coupons"
  ON loyalty_coupons FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

CREATE POLICY "System can manage coupons"
  ON loyalty_coupons FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Campaign messages policies
CREATE POLICY "Admins can view all campaign messages"
  ON campaign_messages FOR SELECT
  USING (auth.is_admin());

CREATE POLICY "System can manage campaign messages"
  ON campaign_messages FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Satisfaction surveys policies
CREATE POLICY "Users can view their own surveys"
  ON satisfaction_surveys FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Users can submit surveys"
  ON satisfaction_surveys FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own surveys"
  ON satisfaction_surveys FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
